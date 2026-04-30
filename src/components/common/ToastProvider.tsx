import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

type ToastInput = {
  action?: ToastAction;
  message: string;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (input: ToastInput) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextToastIdRef = useRef(0);
  const timeoutsRef = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      nextToastIdRef.current += 1;
      const id = `toast-${Date.now()}-${nextToastIdRef.current}`;
      setToasts((current) => [{ ...input, id }, ...current]);
      const timeoutId = window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
      timeoutsRef.current.set(id, timeoutId);
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutsRef.current.values()) {
        window.clearTimeout(timeoutId);
      }
      timeoutsRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      dismissToast,
      showToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="toast-region">
        {toasts.map((toast) => (
          <div className="toast toast--notice" key={toast.id} role="status">
            <span aria-hidden="true" className="toast__icon">
              <svg fill="none" viewBox="0 0 18 18">
                <path
                  d="m5 9 2.3 2.3L13 5.8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <div className="toast__content">
              <span>{toast.message}</span>
              {toast.action ? (
                <button
                  className="toast__action"
                  onClick={() => {
                    void toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  type="button"
                >
                  {toast.action.label}
                </button>
              ) : null}
            </div>
            <button
              aria-label="关闭提示"
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
