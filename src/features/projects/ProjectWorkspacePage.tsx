import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TaskBoardView } from "../../components/tasks/TaskBoardView";
import { TaskDetailPanel } from "../../components/tasks/TaskDetailPanel";
import { TaskListView } from "../../components/tasks/TaskListView";
import { TaskWorkspaceHeader } from "../../components/tasks/TaskWorkspaceHeader";
import { buildProjectSummary } from "../../types/project";
import { useProjectStore } from "./projectStore";
import { useTaskStore } from "../tasks/taskStore";

export function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);

  const [viewMode, setViewMode] = useState<"board" | "list">("list");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? null,
    [projectId, projects],
  );
  const projectTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.projectId === projectId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [projectId, tasks],
  );

  if (!project) {
    return (
      <div className="empty-state">
        <h2>项目不存在</h2>
        <p>返回首页重新选择项目，或者先创建一个新项目。</p>
        <button onClick={() => navigate("/")} type="button">
          返回首页
        </button>
      </div>
    );
  }

  const summary = buildProjectSummary(project, tasks);

  return (
    <div className="project-workspace">
      <section className="project-hero">
        <div>
          <p className="eyebrow">Project Workspace</p>
          <h2>{project.name}</h2>
          <p>{project.description || "这个项目还没有补充说明。"}</p>
        </div>
        <div className="project-hero__metrics">
          <div>
            <span>当前进度</span>
            <strong>{summary.progress}%</strong>
          </div>
          <div>
            <span>进行中</span>
            <strong>{summary.inProgressCount}</strong>
          </div>
          <div>
            <span>阻塞</span>
            <strong>{summary.blockedCount}</strong>
          </div>
          <div>
            <span>最近完成</span>
            <strong>{summary.latestCompletedTaskTitle ?? "暂无"}</strong>
          </div>
        </div>
      </section>

      <section className="workspace-section">
        <TaskWorkspaceHeader
          onChangeViewMode={setViewMode}
          onCreateTask={async (input) => {
            await createTask({
              body: input.body,
              projectId: project.id,
              title: input.title,
            });
          }}
          viewMode={viewMode}
        />

        {viewMode === "list" ? (
          <TaskListView onOpenTask={setActiveTaskId} tasks={projectTasks} />
        ) : (
          <TaskBoardView onOpenTask={setActiveTaskId} tasks={projectTasks} />
        )}
      </section>

      {activeTaskId ? (
        <TaskDetailPanel
          onClose={() => setActiveTaskId(null)}
          project={project}
          taskId={activeTaskId}
        />
      ) : null}
    </div>
  );
}
