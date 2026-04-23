import { useEffect, type ReactNode } from "react";

export function Drawer({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        aria-label={title}
        aria-modal="true"
        className="drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        {children}
      </aside>
    </div>
  );
}
