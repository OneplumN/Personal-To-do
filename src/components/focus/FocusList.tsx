import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "../../lib/constants";
import type { Project } from "../../types/project";
import type { Task, TaskPriority, TaskStatus } from "../../types/task";

export type FocusListItem = {
  project: Project;
  task: Task;
};

export function FocusList({
  items,
  onChangePriority,
  onOpenTask,
  onRemoveTask,
  onUpdateStatus,
}: {
  items: FocusListItem[];
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Today Focus</p>
        <h3>今天还没有焦点任务</h3>
        <p>从项目中的任务手动加入今日焦点，首页就会集中显示它们。</p>
      </div>
    );
  }

  return (
    <div className="focus-list focus-list--dense">
      {items.map(({ project, task }) => (
        <article className="focus-item" key={task.id}>
          <div className="focus-item__row">
            <div className="focus-item__identity">
              <span className="focus-item__project">{project.name}</span>
              <h3>{task.title}</h3>
              <p>最近更新 {new Date(task.updatedAt).toLocaleString("zh-CN")}</p>
            </div>
            <div className="focus-item__controls">
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
              <div
                aria-label={`${task.title} 状态操作`}
                className="status-button-group"
                role="group"
              >
                {TASK_STATUS_ORDER.map((status) => (
                  <button
                    className={
                      task.status === status
                        ? "status-button status-button--active"
                        : "status-button"
                    }
                    key={status}
                    onClick={() => onUpdateStatus(task.id, status)}
                    type="button"
                  >
                    {TASK_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
              <div className="focus-item__actions">
                <button onClick={() => onOpenTask(task.id)} type="button">
                  打开
                </button>
                <button
                  className="ghost-button"
                  onClick={() => onRemoveTask(task.id)}
                  type="button"
                >
                  移出
                </button>
              </div>
            </div>
          </div>
          <div className="focus-item__summary">
            <span className={`status-pill status-pill--${task.status}`}>
              {TASK_STATUS_LABELS[task.status]}
            </span>
            <span className={`priority-pill priority-pill--${task.priority}`}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
            <span>
              {task.body ? task.body : "暂无详情说明"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
