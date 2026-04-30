import { useEffect, useMemo, useState } from "react";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "../../lib/constants";
import { useFocusStore } from "../../features/focus/focusStore";
import { useTaskStore } from "../../features/tasks/taskStore";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_ORDER } from "../../lib/constants";
import type { Project } from "../../types/project";
import type { Task, TaskPriority, TaskStatus } from "../../types/task";
import { ChecklistEditor } from "./ChecklistEditor";

type DetailPillOption<T extends string> = {
  label: string;
  value: T;
};

function TitleEditIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function DetailCloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 7 10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="m17 7-10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function DetailSaveIcon() {
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

function DetailDeleteIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M4.5 7h15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <path
        d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M7 7l.7 11.2A2 2 0 0 0 9.7 20h4.6a2 2 0 0 0 2-1.8L17 7"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function DetailPillMenu<T extends string>({
  activeClassName,
  label,
  menuClassName,
  onChange,
  onOpenChange,
  open,
  options,
  triggerClassName,
  value,
}: {
  activeClassName: (value: T) => string;
  label: string;
  menuClassName: string;
  onChange: (value: T) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  options: DetailPillOption<T>[];
  triggerClassName: string;
  value: T;
}) {
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="task-detail-pill-menu">
      <button
        aria-expanded={open}
        aria-label={`修改${label}：${selectedOption?.label ?? ""}`}
        className={`${triggerClassName} ${activeClassName(value)}`}
        onClick={() => onOpenChange(!open)}
        title={`修改${label}`}
        type="button"
      >
        {selectedOption?.label}
      </button>

      {open ? (
        <div className={`task-detail-pill-menu__menu ${menuClassName}`} role="menu">
          {options.map((option) => (
            <button
              className={
                option.value === value
                  ? `task-detail-pill-menu__option ${activeClassName(option.value)} task-detail-pill-menu__option--active`
                  : `task-detail-pill-menu__option ${activeClassName(option.value)}`
              }
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TaskDetailPanel({
  onClose,
  onDeleted,
  onSaved,
  project,
  taskId,
}: {
  onClose: () => void;
  onDeleted?: (payload: { task: Task; wasInFocus: boolean }) => void;
  onSaved?: () => void;
  project: Project;
  taskId: string | null;
}) {
  const task = useTaskStore((state) =>
    taskId ? state.tasks.find((item) => item.id === taskId) ?? null : null,
  );
  const removeTask = useTaskStore((state) => state.removeTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const setStatus = useTaskStore((state) => state.setStatus);
  const setPriority = useTaskStore((state) => state.setPriority);
  const addChecklistItem = useTaskStore((state) => state.addChecklistItem);
  const updateChecklistItemText = useTaskStore((state) => state.updateChecklistItemText);
  const moveChecklistItem = useTaskStore((state) => state.moveChecklistItem);
  const removeChecklistItem = useTaskStore((state) => state.removeChecklistItem);
  const toggleChecklistItem = useTaskStore((state) => state.toggleChecklistItem);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const removeFocusTask = useFocusStore((state) => state.removeTask);
  const toggleFocusTask = useFocusStore((state) => state.toggleTask);

  const [draftTitle, setDraftTitle] = useState(task?.title ?? "");
  const [draftBody, setDraftBody] = useState(task?.body ?? "");
  const [draftNotes, setDraftNotes] = useState(task?.notes ?? "");
  const [draftStatus, setDraftStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [draftPriority, setDraftPriority] = useState<TaskPriority>(task?.priority ?? "normal");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [openMetaMenu, setOpenMetaMenu] = useState<"priority" | "status" | null>(null);

  useEffect(() => {
    setDraftTitle(task?.title ?? "");
    setDraftBody(task?.body ?? "");
    setDraftNotes(task?.notes ?? "");
    setDraftStatus(task?.status ?? "todo");
    setDraftPriority(task?.priority ?? "normal");
    setIsConfirmingDelete(false);
    setOpenMetaMenu(null);
  }, [task?.body, task?.notes, task?.priority, task?.status, task?.title]);

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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const inFocus = useMemo(
    () => (task ? focusRefs.some((ref) => ref.taskId === task.id) : false),
    [focusRefs, task],
  );

  if (!task) {
    return null;
  }

  const currentTask = task;

  async function handleSaveBasics() {
    await setPriority(currentTask.id, draftPriority);
    await updateTask(currentTask.id, {
      body: draftBody,
      notes: draftNotes,
      title: draftTitle,
    });
    await setStatus(currentTask.id, draftStatus);
  }

  async function handleSaveAndClose() {
    await handleSaveBasics();
    onSaved?.();
    onClose();
  }

  async function handleDeleteTask() {
    const deletedTask = currentTask;
    const wasInFocus = inFocus;
    await removeFocusTask(currentTask.id);
    await removeTask(currentTask.id);
    onDeleted?.({ task: deletedTask, wasInFocus });
    onClose();
  }

  return (
    <div className="modal-backdrop task-detail-backdrop" role="presentation">
      <section
        aria-label="任务详情"
        aria-modal="true"
        className="task-detail-modal"
        role="dialog"
      >
        <header className="task-detail-modal__header">
          <div className="task-detail-modal__title-block">
            <p className="eyebrow">{project.name}</p>
            <label className="task-detail-modal__title-field">
              <span className="sr-only">标题</span>
              <textarea
                aria-label="标题"
                onChange={(event) => setDraftTitle(event.target.value)}
                rows={2}
                title="编辑任务标题"
                value={draftTitle}
              />
              <span aria-hidden="true" className="task-detail-modal__title-edit-icon">
                <TitleEditIcon />
              </span>
            </label>
            <div className="task-detail-modal__meta" aria-label="任务属性">
              <DetailPillMenu
                activeClassName={(priority) => `task-detail-pill--priority-${priority}`}
                label="优先级"
                menuClassName="task-detail-pill-menu__menu--priority"
                onChange={setDraftPriority}
                onOpenChange={(open) => setOpenMetaMenu(open ? "priority" : null)}
                open={openMetaMenu === "priority"}
                options={TASK_PRIORITY_ORDER.map((priority) => ({
                  label: TASK_PRIORITY_LABELS[priority],
                  value: priority,
                }))}
                triggerClassName="task-detail-pill task-detail-pill--priority"
                value={draftPriority}
              />

              <DetailPillMenu
                activeClassName={(status) => `task-detail-pill--status-${status}`}
                label="状态"
                menuClassName="task-detail-pill-menu__menu--status"
                onChange={setDraftStatus}
                onOpenChange={(open) => setOpenMetaMenu(open ? "status" : null)}
                open={openMetaMenu === "status"}
                options={TASK_STATUS_ORDER.map((status) => ({
                  label: TASK_STATUS_LABELS[status],
                  value: status,
                }))}
                triggerClassName="task-detail-pill task-detail-pill--status"
                value={draftStatus}
              />

              <button
                className={
                  inFocus
                    ? "task-detail-modal__focus-chip task-detail-modal__focus-chip--active"
                    : "task-detail-modal__focus-chip"
                }
                onClick={() => toggleFocusTask(currentTask.id)}
                title={inFocus ? "移出今日焦点" : "加入今日焦点"}
                type="button"
              >
                {inFocus ? "移出焦点" : "加入焦点"}
              </button>
            </div>
          </div>
          <button
            aria-label="关闭任务详情"
            className="icon-button icon-action icon-action--danger task-detail-modal__close"
            onClick={onClose}
            title="关闭任务详情"
            type="button"
          >
            <DetailCloseIcon />
          </button>
        </header>

        <div className="task-detail-modal__body">
          <div className="task-detail-modal__primary">
            <ChecklistEditor
              onAddItem={async (text) => {
                await addChecklistItem(task.id, text);
              }}
              onDeleteItem={async (itemId) => {
                await removeChecklistItem(task.id, itemId);
              }}
              onMoveItem={async (itemId, direction) => {
                await moveChecklistItem(task.id, itemId, direction);
              }}
              onToggleItem={async (itemId) => {
                await toggleChecklistItem(task.id, itemId);
              }}
              onUpdateItemText={async (itemId, text) => {
                await updateChecklistItemText(task.id, itemId, text);
              }}
              task={currentTask}
            />
          </div>

          <div className="task-detail-modal__secondary">
            <section className="detail-section">
              <div className="detail-section__header">
                <h4>正文</h4>
              </div>
              <textarea
                aria-label="正文"
                className="detail-textarea"
                onChange={(event) => setDraftBody(event.target.value)}
                rows={6}
                value={draftBody}
              />
            </section>

            <section className="detail-section">
              <div className="detail-section__header">
                <h4>备注</h4>
              </div>
              <textarea
                aria-label="备注"
                className="detail-textarea"
                onChange={(event) => setDraftNotes(event.target.value)}
                rows={5}
                value={draftNotes}
              />
            </section>
          </div>
        </div>

        <footer className="task-detail-modal__footer">
          <div className="task-detail-modal__delete-zone">
            {isConfirmingDelete ? (
              <span className="task-detail-modal__delete-copy">确认删除？</span>
            ) : null}
            <button
              aria-label={isConfirmingDelete ? "确认删除任务" : "删除任务"}
              className={
                isConfirmingDelete
                  ? "icon-button icon-action icon-action--danger task-detail-modal__delete task-detail-modal__delete--confirm"
                  : "icon-button icon-action icon-action--danger task-detail-modal__delete"
              }
              onClick={() => {
                if (!isConfirmingDelete) {
                  setIsConfirmingDelete(true);
                  return;
                }
                void handleDeleteTask();
              }}
              title={isConfirmingDelete ? "确认删除任务" : "删除任务"}
              type="button"
            >
              <DetailDeleteIcon />
            </button>
          </div>
          <button
            aria-label="保存并关闭"
            className="icon-button icon-action icon-action--success"
            onClick={() => {
              void handleSaveAndClose();
            }}
            title="保存并关闭"
            type="button"
          >
            <DetailSaveIcon />
          </button>
        </footer>
      </section>
    </div>
  );
}
