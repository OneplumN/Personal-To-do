import type { ReactNode } from "react";

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
