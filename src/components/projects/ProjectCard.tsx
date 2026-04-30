import type { CSSProperties } from "react";
import { buildProjectSummary, type Project } from "../../types/project";
import type { Task } from "../../types/task";

const PROJECT_CARD_TONES = [
  {
    accent: "rgba(216, 162, 74, 0.52)",
    border: "rgba(216, 162, 74, 0.16)",
    surface: "rgba(255, 247, 235, 0.56)",
  },
  {
    accent: "rgba(90, 200, 250, 0.5)",
    border: "rgba(90, 200, 250, 0.14)",
    surface: "rgba(239, 248, 255, 0.56)",
  },
  {
    accent: "rgba(52, 211, 153, 0.46)",
    border: "rgba(52, 211, 153, 0.14)",
    surface: "rgba(241, 251, 246, 0.54)",
  },
  {
    accent: "rgba(125, 138, 255, 0.34)",
    border: "rgba(125, 138, 255, 0.12)",
    surface: "rgba(244, 245, 253, 0.54)",
  },
] as const;

function getProjectTone(projectId: string) {
  const hash = Array.from(projectId).reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
  return PROJECT_CARD_TONES[hash % PROJECT_CARD_TONES.length];
}

export function ProjectCard({
  onEdit,
  onOpen,
  project,
  tasks,
}: {
  onEdit: (projectId: string) => void;
  onOpen: (projectId: string) => void;
  project: Project;
  tasks: Task[];
}) {
  const summary = buildProjectSummary(project, tasks);
  const progressLabel = String(summary.progress).padStart(2, "0");
  const tone = getProjectTone(project.id);

  return (
    <article
      className="project-card"
      style={
        {
          "--project-card-accent": tone.accent,
          "--project-card-border": tone.border,
          "--project-card-surface": tone.surface,
        } as CSSProperties
      }
    >
      <div className="project-card__header">
        <div className="project-card__title-block">
          <h3>{project.name}</h3>
        </div>
      </div>
      <div className="project-card__progress">
        <span className="project-card__progress-value">{progressLabel}%</span>
        <div
          aria-hidden="true"
          className="project-card__progress-track"
        >
          <span
            className="project-card__progress-fill"
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>
      <div className="project-card__footer">
        <span className="project-card__completion">
          {summary.doneCount}/{summary.totalTasks}
        </span>
        <div className="project-card__actions">
          <button
            aria-label="编辑"
            className="project-card__detail-button"
            data-tooltip="编辑"
            onClick={() => onEdit(project.id)}
            title="编辑"
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 24 24"
              width="18"
            >
              <path
                d="M12 20h8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
              <path
                d="M15.5 4.5a2.12 2.12 0 1 1 3 3L8 18l-4 1 1-4 10.5-10.5Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          <button
            aria-label="进入"
            className="project-card__detail-button"
            data-tooltip="进入"
            onClick={() => onOpen(project.id)}
            title="进入"
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              viewBox="0 0 18 18"
              width="18"
            >
              <path
                d="M5.25 12.75L12.75 5.25M7.5 5.25H12.75V10.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
