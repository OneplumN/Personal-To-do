import { useState } from "react";
import { Modal } from "../common/Modal";

export function TaskWorkspaceHeader({
  onCreateTask,
}: {
  onCreateTask: (input: { body: string; title: string }) => Promise<void>;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    await onCreateTask({
      body: "",
      title,
    });
    setTitle("");
    setIsCreating(false);
  }

  function handleTitleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <>
      <div className="task-workspace-header">
        <h2>TASK</h2>
        <div className="task-workspace-header__actions">
          <button
            aria-label="新建任务"
            className="task-workspace-header__create"
            onClick={() => setIsCreating(true)}
            title="新建任务"
            type="button"
          >
            +
          </button>
        </div>
      </div>

      {isCreating ? (
        <Modal className="task-create-modal" onClose={() => setIsCreating(false)} title="新建任务">
          <form className="modal__body task-create-modal__body" onSubmit={handleSubmit}>
            <textarea
              aria-label="任务标题"
              autoFocus
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder="任务标题"
              rows={2}
              value={title}
            />
            <div className="modal__actions">
              <button
                aria-label="保存任务"
                className="icon-button icon-action icon-action--success task-create-modal__save"
                title="保存"
                type="submit"
              >
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                  <path
                    d="m5 12.5 4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                  />
                </svg>
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
