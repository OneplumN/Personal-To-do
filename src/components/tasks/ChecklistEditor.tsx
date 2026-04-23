import { useState } from "react";
import type { Task } from "../../types/task";

export function ChecklistEditor({
  onAddItem,
  onToggleItem,
  task,
}: {
  onAddItem: (text: string) => Promise<void>;
  onToggleItem: (itemId: string) => Promise<void>;
  task: Task;
}) {
  const [draft, setDraft] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAddItem(draft);
    setDraft("");
  }

  return (
    <section className="detail-section">
      <div className="detail-section__header">
        <h4>Checklist</h4>
      </div>
      <div className="checklist">
        {task.checklist.map((item) => (
          <label className="checklist-item" key={item.id}>
            <input
              checked={item.done}
              onChange={() => onToggleItem(item.id)}
              type="checkbox"
            />
            <span>{item.text}</span>
          </label>
        ))}
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            onChange={(event) => setDraft(event.target.value)}
            placeholder="添加子任务"
            value={draft}
          />
          <button type="submit">添加</button>
        </form>
      </div>
    </section>
  );
}
