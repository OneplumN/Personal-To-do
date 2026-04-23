import { buildProjectSummary, type Project } from "../../types/project";
import type { Task } from "../../types/task";

export function ProjectCard({
  onOpen,
  project,
  tasks,
}: {
  onOpen: (projectId: string) => void;
  project: Project;
  tasks: Task[];
}) {
  const summary = buildProjectSummary(project, tasks);

  return (
    <article className="project-card">
      <div className="project-card__header">
        <div>
          <p className="eyebrow">Project</p>
          <h3>{project.name}</h3>
        </div>
        <span className="project-card__progress">{summary.progress}%</span>
      </div>
      {project.description ? <p className="project-card__description">{project.description}</p> : null}
      <dl className="project-card__stats">
        <div>
          <dt>进行中</dt>
          <dd>{summary.inProgressCount}</dd>
        </div>
        <div>
          <dt>阻塞</dt>
          <dd>{summary.blockedCount}</dd>
        </div>
        <div>
          <dt>任务总数</dt>
          <dd>{summary.totalTasks}</dd>
        </div>
      </dl>
      <div className="project-card__footer">
        <p>
          最近完成：
          <strong>{summary.latestCompletedTaskTitle ?? "暂无"}</strong>
        </p>
        <button onClick={() => onOpen(project.id)} type="button">
          进入项目
        </button>
      </div>
    </article>
  );
}
