import { useEffect, useMemo, useState } from "react";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "../../lib/constants";
import { useFocusStore } from "../../features/focus/focusStore";
import { useTaskStore } from "../../features/tasks/taskStore";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_ORDER } from "../../lib/constants";
import type { Project } from "../../types/project";
import type { TaskPriority, TaskStatus } from "../../types/task";
import { ChecklistEditor } from "./ChecklistEditor";
import { Drawer } from "../common/Drawer";

export function TaskDetailPanel({
  onClose,
  project,
  taskId,
}: {
  onClose: () => void;
  project: Project;
  taskId: string | null;
}) {
  const task = useTaskStore((state) =>
    taskId ? state.tasks.find((item) => item.id === taskId) ?? null : null,
  );
  const updateTask = useTaskStore((state) => state.updateTask);
  const setStatus = useTaskStore((state) => state.setStatus);
  const setPriority = useTaskStore((state) => state.setPriority);
  const addChecklistItem = useTaskStore((state) => state.addChecklistItem);
  const updateChecklistItemText = useTaskStore((state) => state.updateChecklistItemText);
  const moveChecklistItem = useTaskStore((state) => state.moveChecklistItem);
  const removeChecklistItem = useTaskStore((state) => state.removeChecklistItem);
  const toggleChecklistItem = useTaskStore((state) => state.toggleChecklistItem);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const toggleFocusTask = useFocusStore((state) => state.toggleTask);

  const [draftTitle, setDraftTitle] = useState(task?.title ?? "");
  const [draftBody, setDraftBody] = useState(task?.body ?? "");
  const [draftNotes, setDraftNotes] = useState(task?.notes ?? "");
  const [draftStatus, setDraftStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [draftPriority, setDraftPriority] = useState<TaskPriority>(task?.priority ?? "normal");

  useEffect(() => {
    setDraftTitle(task?.title ?? "");
    setDraftBody(task?.body ?? "");
    setDraftNotes(task?.notes ?? "");
    setDraftStatus(task?.status ?? "todo");
    setDraftPriority(task?.priority ?? "normal");
  }, [task?.body, task?.notes, task?.priority, task?.status, task?.title]);

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

  return (
    <>
      <Drawer onClose={onClose} title="任务详情">
        <header className="drawer__header">
          <div>
            <p className="eyebrow">{project.name}</p>
            <h3>任务详情</h3>
          </div>
          <button
            aria-label="关闭任务详情"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </header>

        <div className="drawer__body task-drawer">
          <section className="task-drawer__topbar">
            <label className="task-drawer__compact-field">
              <span>优先级</span>
              <select
                aria-label="优先级"
                onChange={(event) => setDraftPriority(event.target.value as TaskPriority)}
                value={draftPriority}
              >
                {TASK_PRIORITY_ORDER.map((priority) => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </label>

            <label className="task-drawer__title-field">
              <span>标题</span>
              <input
                aria-label="标题"
                onChange={(event) => setDraftTitle(event.target.value)}
                value={draftTitle}
              />
            </label>

            <label className="task-drawer__compact-field">
              <span>状态</span>
              <select
                aria-label="状态"
                onChange={(event) => setDraftStatus(event.target.value as TaskStatus)}
                value={draftStatus}
              >
                {TASK_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          </section>

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

          <section className="detail-section">
            <div className="detail-section__header">
              <h4>正文</h4>
            </div>
            <textarea
              aria-label="正文"
              onChange={(event) => setDraftBody(event.target.value)}
              rows={6}
              value={draftBody}
            />
          </section>

          <section className="detail-section">
            <div className="detail-section__header">
              <h4>备注</h4>
              <button
                className={inFocus ? "ghost-button ghost-button--active" : "ghost-button"}
                onClick={() => toggleFocusTask(currentTask.id)}
                type="button"
              >
                {inFocus ? "移出今日焦点" : "加入今日焦点"}
              </button>
            </div>
            <textarea
              aria-label="备注"
              onChange={(event) => setDraftNotes(event.target.value)}
              rows={5}
              value={draftNotes}
            />
          </section>
        </div>

        <footer className="drawer__footer">
          <button className="ghost-button" onClick={onClose} type="button">
            关闭
          </button>
          <button
            onClick={() => {
              void handleSaveBasics();
            }}
            type="button"
          >
            保存
          </button>
        </footer>
      </Drawer>
    </>
  );
}
