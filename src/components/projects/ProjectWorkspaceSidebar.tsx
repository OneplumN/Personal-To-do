import { buildProjectSummary, type Project } from "../../types/project";
import type { Task } from "../../types/task";

export function ProjectWorkspaceSidebar({
  currentProjectId,
  onSelectProject,
  projects,
  tasks,
}: {
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  projects: Project[];
  tasks: Task[];
}) {
  return (
    <nav aria-label="项目" className="project-sidebar">
      <div className="project-sidebar__nav">
        {projects.map((project) => {
          const summary = buildProjectSummary(project, tasks);

          return (
            <button
              aria-label={project.name}
              className={
                project.id === currentProjectId
                  ? "project-sidebar__item project-sidebar__item--active"
                  : "project-sidebar__item"
              }
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              type="button"
            >
              <span aria-hidden="true" className="project-sidebar__indicator" />
              <span className="project-sidebar__name">{project.name}</span>
              <span className="project-sidebar__progress">
                {summary.doneCount}/{summary.totalTasks}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
