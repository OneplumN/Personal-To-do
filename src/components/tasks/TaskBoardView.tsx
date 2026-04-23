import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "../../lib/constants";
import type { Task, TaskPriority, TaskStatus } from "../../types/task";

export function TaskBoardView({
  focusTaskIds,
  onChangePriority,
  onOpenTask,
  onToggleFocus,
  onUpdateStatus,
  tasks,
}: {
  focusTaskIds: string[];
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenTask: (taskId: string) => void;
  onToggleFocus: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  tasks: Task[];
}) {
  return (
    <div className="task-board">
      {TASK_STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <section className={`task-column task-column--${status}`} key={status}>
            <header className="task-column__header">
              <h3>{TASK_STATUS_LABELS[status]}</h3>
              <span>{columnTasks.length}</span>
            </header>
            <div className="task-column__body">
              {columnTasks.map((task) => (
                <article className="task-board-item" key={task.id}>
                  <div className="task-board-item__top">
                    <div>
                      <h4>{task.title}</h4>
                      <p>{task.body || "暂无详情说明"}</p>
                    </div>
                    <select
                      aria-label={`${task.title} 优先级`}
                      onChange={(event) =>
                        onChangePriority(task.id, event.target.value as TaskPriority)
                      }
                      value={task.priority}
                    >
                      {TASK_PRIORITY_ORDER.map((priority) => (
                        <option key={priority} value={priority}>
                          {TASK_PRIORITY_LABELS[priority]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="task-board-item__meta">
                    <span>{new Date(task.updatedAt).toLocaleString("zh-CN")}</span>
                    <span>
                      checklist {task.checklist.filter((item) => item.done).length}/
                      {task.checklist.length}
                    </span>
                  </div>
                  <div className="task-board-item__actions">
                    <div className="status-button-group" role="group">
                      {TASK_STATUS_ORDER.map((nextStatus) => (
                        <button
                          className={
                            task.status === nextStatus
                              ? "status-button status-button--active"
                              : "status-button"
                          }
                          key={nextStatus}
                          onClick={() => onUpdateStatus(task.id, nextStatus)}
                          type="button"
                        >
                          {TASK_STATUS_LABELS[nextStatus]}
                        </button>
                      ))}
                    </div>
                    <div className="task-board-item__utility">
                      <button onClick={() => onOpenTask(task.id)} type="button">
                        打开详情
                      </button>
                      <button
                        className={focusTaskIds.includes(task.id) ? "ghost-button ghost-button--active" : "ghost-button"}
                        onClick={() => onToggleFocus(task.id)}
                        type="button"
                      >
                        {focusTaskIds.includes(task.id) ? "移出焦点" : "加入焦点"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
