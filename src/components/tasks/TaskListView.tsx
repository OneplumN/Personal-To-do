import { getChecklistProgress, type Task } from "../../types/task";
import { TASK_STATUS_LABELS } from "../../lib/constants";

export function TaskListView({
  onOpenTask,
  tasks,
}: {
  onOpenTask: (taskId: string) => void;
  tasks: Task[];
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h3>这个项目还没有任务</h3>
        <p>先创建任务，再持续更新内容、checklist 和进展记录。</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const checklist = getChecklistProgress(task);
        return (
          <button className="task-list-row" key={task.id} onClick={() => onOpenTask(task.id)} type="button">
            <div className="task-list-row__title">
              <h3>{task.title}</h3>
              <p>{task.body || "暂无详情说明"}</p>
            </div>
            <div className="task-list-row__meta">
              <span className={`status-pill status-pill--${task.status}`}>
                {TASK_STATUS_LABELS[task.status]}
              </span>
              <span>
                checklist {checklist.completed}/{checklist.total}
              </span>
              <span>{new Date(task.updatedAt).toLocaleString("zh-CN")}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
