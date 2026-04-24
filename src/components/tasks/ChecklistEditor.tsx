import { useMemo, useState } from "react";
import type { ChecklistItem, Task } from "../../types/task";

export function ChecklistEditor({
  onAddItem,
  onDeleteItem,
  onMoveItem,
  onToggleItem,
  onUpdateItemText,
  task,
}: {
  onAddItem: (text: string) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onMoveItem: (itemId: string, direction: "up" | "down") => Promise<void>;
  onToggleItem: (itemId: string) => Promise<void>;
  onUpdateItemText: (itemId: string, text: string) => Promise<void>;
  task: Task;
}) {
  const [draft, setDraft] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const orderIndexById = useMemo(
    () =>
      new Map(task.checklist.map((item, index) => [item.id, index])),
    [task.checklist],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAddItem(draft);
    setDraft("");
  }

  async function handleSaveItem(item: ChecklistItem) {
    await onUpdateItemText(item.id, editingText);
    setEditingItemId(null);
    setEditingText("");
  }

  return (
    <section className="detail-section">
      <div className="detail-section__header">
        <h4>Checklist</h4>
      </div>
      <div className="checklist checklist--compact">
        {task.checklist.map((item) => (
          <div className="checklist-row" key={item.id}>
            <label className="checklist-item">
              <input
                checked={item.done}
                onChange={() => onToggleItem(item.id)}
                type="checkbox"
              />
            </label>

            {editingItemId === item.id ? (
              <input
                aria-label="编辑子项"
                autoFocus
                className="checklist-row__input"
                onBlur={() => void handleSaveItem(item)}
                onChange={(event) => setEditingText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSaveItem(item);
                  }
                }}
                value={editingText}
              />
            ) : (
              <button
                className={`checklist-row__text ${item.done ? "checklist-row__text--done" : ""}`}
                onClick={() => {
                  setEditingItemId(item.id);
                  setEditingText(item.text);
                }}
                type="button"
              >
                {item.text}
              </button>
            )}

            <div className="checklist-row__actions">
              <button
                aria-label="上移子项"
                className="ghost-button"
                disabled={orderIndexById.get(item.id) === 0}
                onClick={() => onMoveItem(item.id, "up")}
                type="button"
              >
                ↑
              </button>
              <button
                aria-label="下移子项"
                className="ghost-button"
                disabled={orderIndexById.get(item.id) === task.checklist.length - 1}
                onClick={() => onMoveItem(item.id, "down")}
                type="button"
              >
                ↓
              </button>
              <button
                aria-label="删除子项"
                className="ghost-button"
                onClick={() => onDeleteItem(item.id)}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            aria-label="添加子任务"
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
