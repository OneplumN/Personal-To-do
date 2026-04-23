import { useEffect, useMemo, useState } from "react";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "../../lib/constants";
import { useFocusStore } from "../../features/focus/focusStore";
import { useTaskStore } from "../../features/tasks/taskStore";
import type { Project } from "../../types/project";
import type { TaskStatus } from "../../types/task";
import { ChecklistEditor } from "./ChecklistEditor";
import { ProgressLogEditor } from "./ProgressLogEditor";
import { TaskCompletionDialog } from "./TaskCompletionDialog";
import { Modal } from "../common/Modal";

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
  const addChecklistItem = useTaskStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useTaskStore((state) => state.toggleChecklistItem);
  const appendProgressLog = useTaskStore((state) => state.appendProgressLog);
  const completeTask = useTaskStore((state) => state.completeTask);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const toggleFocusTask = useFocusStore((state) => state.toggleTask);

  const [draftTitle, setDraftTitle] = useState(task?.title ?? "");
  const [draftBody, setDraftBody] = useState(task?.body ?? "");
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    setDraftTitle(task?.title ?? "");
    setDraftBody(task?.body ?? "");
  }, [task?.body, task?.title]);

  const inFocus = useMemo(
    () => (task ? focusRefs.some((ref) => ref.taskId === task.id) : false),
    [focusRefs, task],
  );

  if (!task) {
    return null;
  }

  const currentTask = task;

  async function handleSaveBasics() {
    await updateTask(currentTask.id, {
      body: draftBody,
      title: draftTitle,
    });
  }

  async function handleStatusChange(status: TaskStatus) {
    if (status === "done") {
      setShowCompletion(true);
      return;
    }
    await setStatus(currentTask.id, status);
  }

  return (
    <>
      <Modal onClose={onClose} title="任务详情">
        <div className="modal__body task-detail">
          <div className="task-detail__meta">
            <span>{project.name}</span>
            <label className="field field--inline">
              <span>状态</span>
              <select
                onChange={(event) => handleStatusChange(event.target.value as TaskStatus)}
                value={currentTask.status}
              >
                {TASK_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={inFocus ? "ghost-button ghost-button--active" : "ghost-button"}
              onClick={() => toggleFocusTask(currentTask.id)}
              type="button"
            >
              {inFocus ? "移出今日焦点" : "加入今日焦点"}
            </button>
          </div>

          <section className="detail-section">
            <div className="detail-section__header">
              <h4>任务内容</h4>
              <button onClick={handleSaveBasics} type="button">
                保存修改
              </button>
            </div>
            <label className="field">
              <span>标题</span>
              <input onChange={(event) => setDraftTitle(event.target.value)} value={draftTitle} />
            </label>
            <label className="field">
              <span>详情正文</span>
              <textarea onChange={(event) => setDraftBody(event.target.value)} rows={6} value={draftBody} />
            </label>
          </section>

          <ChecklistEditor
            onAddItem={async (text) => {
              await addChecklistItem(task.id, text);
            }}
            onToggleItem={async (itemId) => {
              await toggleChecklistItem(task.id, itemId);
            }}
            task={currentTask}
          />

          <ProgressLogEditor
            onAppendLog={async (content) => {
              await appendProgressLog(currentTask.id, content);
            }}
            task={currentTask}
          />
        </div>
      </Modal>

      {showCompletion ? (
        <TaskCompletionDialog
          onClose={() => setShowCompletion(false)}
          onConfirm={async (input) => {
            await completeTask(currentTask.id, input);
            setShowCompletion(false);
          }}
          taskTitle={currentTask.title}
        />
      ) : null}
    </>
  );
}
