import type { ReactNode } from "react";

export function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-modal="true" className="modal" role="dialog">
        <header className="modal__header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h3>{title}</h3>
          </div>
          <button
            aria-label="关闭对话框"
            className="icon-button"
            onClick={onClose}
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
