import { TASK_STATUS_LABELS } from "../../lib/constants";
import type { Project } from "../../types/project";
import type { Task, TaskStatus } from "../../types/task";

export type FocusListItem = {
  project: Project;
  task: Task;
};

export function FocusList({
  items,
  onOpenTask,
  onRemoveTask,
  onUpdateStatus,
}: {
  items: FocusListItem[];
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
    <div className="focus-list">
      {items.map(({ project, task }) => (
        <article className="focus-item" key={task.id}>
          <div className="focus-item__meta">
            <span className="focus-item__project">{project.name}</span>
            <span className={`status-pill status-pill--${task.status}`}>
              {TASK_STATUS_LABELS[task.status]}
            </span>
          </div>
          <div className="focus-item__body">
            <div>
              <h3>{task.title}</h3>
              <p>最近更新 {new Date(task.updatedAt).toLocaleString("zh-CN")}</p>
            </div>
            <div className="focus-item__actions">
              <select
                aria-label={`${task.title} 状态`}
                onChange={(event) =>
                  onUpdateStatus(task.id, event.target.value as TaskStatus)
                }
                value={task.status}
              >
                <option value="todo">待做</option>
                <option value="in_progress">进行中</option>
                <option value="blocked">阻塞</option>
                <option value="done">已完成</option>
              </select>
              <button onClick={() => onOpenTask(task.id)} type="button">
                打开任务
              </button>
              <button
                className="ghost-button"
                onClick={() => onRemoveTask(task.id)}
                type="button"
              >
                移出焦点
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
