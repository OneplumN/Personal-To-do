import { useState } from "react";

export function TaskWorkspaceHeader({
  onCreateTask,
  viewMode,
  onChangeViewMode,
}: {
  onChangeViewMode: (mode: "board" | "list") => void;
  onCreateTask: (input: { body: string; title: string }) => Promise<void>;
  viewMode: "board" | "list";
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    await onCreateTask({
      body,
      title,
    });
    setBody("");
    setTitle("");
    setIsCreating(false);
  }

  return (
    <div className="task-workspace-header">
      <div>
        <p className="eyebrow">Task Workspace</p>
        <h2>任务工作区</h2>
      </div>
      <div className="task-workspace-header__actions">
        <div className="segmented-control" role="tablist">
          <button
            className={viewMode === "list" ? "segmented-control__button segmented-control__button--active" : "segmented-control__button"}
            onClick={() => onChangeViewMode("list")}
            type="button"
          >
            列表
          </button>
          <button
            className={viewMode === "board" ? "segmented-control__button segmented-control__button--active" : "segmented-control__button"}
            onClick={() => onChangeViewMode("board")}
            type="button"
          >
            看板
          </button>
        </div>
        <button onClick={() => setIsCreating((value) => !value)} type="button">
          {isCreating ? "取消" : "+ 新建任务"}
        </button>
      </div>

      {isCreating ? (
        <form className="task-create-form" onSubmit={handleSubmit}>
          <input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="任务标题"
            value={title}
          />
          <textarea
            onChange={(event) => setBody(event.target.value)}
            placeholder="任务背景、目标或补充说明"
            rows={3}
            value={body}
          />
          <div className="task-create-form__actions">
            <button type="submit">保存任务</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
