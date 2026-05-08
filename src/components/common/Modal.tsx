import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const modalStack: symbol[] = [];

export function Modal({
  children,
  className,
  onClose,
  title,
}: {
  children: ReactNode;
  className?: string;
  onClose: () => void;
  title: string;
}) {
  const modalClassName = className ? `modal ${className}` : "modal";
  const modalIdRef = useRef<symbol | null>(null);
  const onCloseRef = useRef(onClose);

  if (modalIdRef.current === null) {
    modalIdRef.current = Symbol(title);
  }

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const modalId = modalIdRef.current;

    if (modalId === null) {
      return undefined;
    }

    modalStack.push(modalId);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }

      if (modalStack[modalStack.length - 1] !== modalId) {
        return;
      }

      event.preventDefault();
      onCloseRef.current();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      const modalIndex = modalStack.lastIndexOf(modalId);

      if (modalIndex >= 0) {
        modalStack.splice(modalIndex, 1);
      }

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-label={title} aria-modal="true" className={modalClassName} role="dialog">
        <header className="modal__header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h3>{title}</h3>
          </div>
          <button
            aria-label="关闭对话框"
            className="icon-button icon-action icon-action--danger modal__close"
            onClick={onClose}
            title="关闭"
            type="button"
          >
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
