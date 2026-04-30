import { useEffect, useMemo, useRef, useState } from "react";
import type { ChecklistItem, Task } from "../../types/task";

function ConfirmIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

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
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const orderIndexById = useMemo(
    () =>
      new Map(task.checklist.map((item, index) => [item.id, index])),
    [task.checklist],
  );

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) {
      inputRef.current?.focus();
      return;
    }

    await onAddItem(draft);
    setDraft("");
    setIsAdding(false);
  }

  async function handleSaveItem(item: ChecklistItem) {
    await onUpdateItemText(item.id, editingText);
    setEditingItemId(null);
    setEditingText("");
  }

  function handleCancelAddItem() {
    setDraft("");
    setIsAdding(false);
  }

  async function handleAddItem() {
    if (!isAdding) {
      setIsAdding(true);
      return;
    }

    inputRef.current?.focus();
  }

  async function moveItemToPosition(fromItemId: string, toItemId: string) {
    const fromIndex = orderIndexById.get(fromItemId);
    const toIndex = orderIndexById.get(toItemId);

    if (fromIndex === undefined || toIndex === undefined || fromIndex === toIndex) {
      return;
    }

    const direction = fromIndex < toIndex ? "down" : "up";
    const steps = Math.abs(fromIndex - toIndex);

    for (let index = 0; index < steps; index += 1) {
      await onMoveItem(fromItemId, direction);
    }
  }

  return (
    <section className="detail-section">
      <div className="detail-section__header">
        <h4>Tasklist</h4>
        <button
          aria-label="添加子任务"
          aria-expanded={isAdding}
          className="icon-button checklist-add-button"
          onClick={() => {
            void handleAddItem();
          }}
          type="button"
        >
          +
        </button>
      </div>
      {isAdding ? (
        <form className="checklist-add-popover" onSubmit={handleSubmit}>
          <input
            aria-label="添加子任务"
            ref={inputRef}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setDraft("");
                setIsAdding(false);
              }
            }}
            placeholder="添加子任务"
            value={draft}
          />
          <button
            aria-label="确认添加子任务"
            className="icon-button checklist-add-confirm"
            type="submit"
          >
            <ConfirmIcon />
          </button>
          <button
            aria-label="取消添加子任务"
            className="icon-button checklist-add-cancel"
            onClick={handleCancelAddItem}
            type="button"
          >
            <CancelIcon />
          </button>
        </form>
      ) : null}
      <div className="checklist checklist--compact">
        {task.checklist.map((item, index) => (
          <div
            className={
              draggedItemId === item.id
                ? "checklist-row checklist-row--dragging"
                : dragOverItemId === item.id
                  ? "checklist-row checklist-row--drop-target"
                  : "checklist-row"
            }
            draggable
            key={item.id}
            onDragEnd={() => {
              setDraggedItemId(null);
              setDragOverItemId(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (draggedItemId && draggedItemId !== item.id) {
                setDragOverItemId(item.id);
              }
            }}
            onDragStart={() => {
              setDraggedItemId(item.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedItemId && draggedItemId !== item.id) {
                void moveItemToPosition(draggedItemId, item.id);
              }
              setDraggedItemId(null);
              setDragOverItemId(null);
            }}
          >
            <span aria-hidden="true" className="checklist-row__drag-handle">
              ⋮⋮
            </span>
            <span aria-hidden="true" className="checklist-row__index">
              {index + 1}.
            </span>
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
      </div>
    </section>
  );
}
