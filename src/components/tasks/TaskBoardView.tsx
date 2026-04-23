import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "../../lib/constants";
import type { Task } from "../../types/task";

export function TaskBoardView({
  onOpenTask,
  tasks,
}: {
  onOpenTask: (taskId: string) => void;
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
                <button className="task-card" key={task.id} onClick={() => onOpenTask(task.id)} type="button">
                  <h4>{task.title}</h4>
                  <p>{task.body || "暂无详情说明"}</p>
                  <span>{new Date(task.updatedAt).toLocaleString("zh-CN")}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
