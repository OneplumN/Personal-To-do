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
  onMoveItem: (itemId: string, toIndex: number) => Promise<void>;
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
  const [showCompletedItems, setShowCompletedItems] = useState(false);
  const pointerDragRef = useRef<{
    active: boolean;
    itemId: string;
    pointerId: number;
    startX: number;
    startY: number;
    targetId: string | null;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const pendingItems = useMemo(
    () => task.checklist.filter((item) => !item.done),
    [task.checklist],
  );
  const completedItems = useMemo(
    () => task.checklist.filter((item) => item.done),
    [task.checklist],
  );
  const visibleItems = showCompletedItems ? [...pendingItems, ...completedItems] : pendingItems;

  useEffect(() => {
    if (completedItems.length === 0) {
      setShowCompletedItems(false);
    }
  }, [completedItems.length]);

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

  function getChecklistRowFromPoint(clientX: number, clientY: number) {
    return document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>(".checklist-row[data-checklist-item-id]") ?? null;
  }

  function clearPointerDrag() {
    pointerDragRef.current = null;
    setDraggedItemId(null);
    setDragOverItemId(null);
  }

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const session = pointerDragRef.current;
      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      const movedX = Math.abs(event.clientX - session.startX);
      const movedY = Math.abs(event.clientY - session.startY);
      if (!session.active && Math.max(movedX, movedY) < 4) {
        return;
      }

      event.preventDefault();
      session.active = true;

      const targetRow = getChecklistRowFromPoint(event.clientX, event.clientY);
      const targetId = targetRow?.dataset.checklistItemId ?? null;
      session.targetId = targetId;
      setDragOverItemId(targetId && targetId !== session.itemId ? targetId : null);
    }

    function handlePointerUp(event: PointerEvent) {
      const session = pointerDragRef.current;
      if (!session || event.pointerId !== session.pointerId) {
        return;
      }

      const targetId = session.targetId;
      if (session.active && targetId && targetId !== session.itemId) {
        const targetIndex = task.checklist.findIndex((item) => item.id === targetId);
        if (targetIndex !== -1) {
          void onMoveItem(session.itemId, targetIndex);
        }
      }
      clearPointerDrag();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", clearPointerDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", clearPointerDrag);
    };
  }, [onMoveItem, task.checklist]);

  function getOriginalChecklistIndex(itemId: string) {
    return task.checklist.findIndex((item) => item.id === itemId);
  }

  return (
    <section className="detail-section">
      <div className="detail-section__header">
        <h4>清单</h4>
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
        {visibleItems.length === 0 && completedItems.length > 0 ? (
          <p className="checklist__empty">未完成清单已清空。</p>
        ) : null}
        {visibleItems.map((item) => (
          <div
            className={
              draggedItemId === item.id
                ? "checklist-row checklist-row--dragging"
                : dragOverItemId === item.id
                  ? "checklist-row checklist-row--drop-target"
                  : "checklist-row"
            }
            data-checklist-item-id={item.id}
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
                const targetIndex = getOriginalChecklistIndex(item.id);
                if (targetIndex !== -1) {
                  void onMoveItem(draggedItemId, targetIndex);
                }
              }
              setDraggedItemId(null);
              setDragOverItemId(null);
            }}
          >
            <span
              aria-hidden="true"
              className="checklist-row__drag-handle"
              draggable
              onPointerDown={(event) => {
                if (event.button > 0) {
                  return;
                }
                event.preventDefault();
                pointerDragRef.current = {
                  active: false,
                  itemId: item.id,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  targetId: null,
                };
                setDraggedItemId(item.id);
              }}
              onDragStart={(event) => {
                if (event.dataTransfer) {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.id);
                }
                setDraggedItemId(item.id);
              }}
            >
              ⋮⋮
            </span>
            <span aria-hidden="true" className="checklist-row__index">
              {getOriginalChecklistIndex(item.id) + 1}.
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
        {completedItems.length > 0 ? (
          <button
            className="checklist-completed-toggle"
            onClick={() => setShowCompletedItems((current) => !current)}
            type="button"
          >
            {showCompletedItems ? "收起已完成" : `已完成 ${completedItems.length} 项`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
