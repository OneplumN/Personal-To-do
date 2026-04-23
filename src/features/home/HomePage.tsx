import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../focus/focusStore";
import { useProjectStore } from "../projects/projectStore";
import { useTaskStore } from "../tasks/taskStore";
import { FocusList } from "../../components/focus/FocusList";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { Modal } from "../../components/common/Modal";
import { TaskDetailPanel } from "../../components/tasks/TaskDetailPanel";
import type { TaskPriority, TaskStatus } from "../../types/task";

export function HomePage() {
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const tasks = useTaskStore((state) => state.tasks);
  const setTaskStatus = useTaskStore((state) => state.setStatus);
  const setTaskPriority = useTaskStore((state) => state.setPriority);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const removeFocusTask = useFocusStore((state) => state.removeTask);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<"complete" | "view">("view");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const focusItems = useMemo(
    () =>
      focusRefs
        .map((ref) => {
          const task = tasks.find((item) => item.id === ref.taskId);
          if (!task) {
            return null;
          }
          const project = projects.find((item) => item.id === task.projectId);
          if (!project) {
            return null;
          }
          return {
            project,
            task,
          };
        })
        .filter((item): item is { project: typeof projects[number]; task: typeof tasks[number] } =>
          Boolean(item),
        ),
    [focusRefs, projects, tasks],
  );

  const activeTask = activeTaskId
    ? tasks.find((task) => task.id === activeTaskId) ?? null
    : null;
  const activeTaskProject = activeTask
    ? projects.find((project) => project.id === activeTask.projectId) ?? null
    : null;

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName.trim()) {
      return;
    }
    const project = await createProject({
      description: projectDescription,
      name: projectName,
    });
    setProjectName("");
    setProjectDescription("");
    setIsCreatingProject(false);
    navigate(`/projects/${project.id}`);
  }

  function openTask(taskId: string, mode: "complete" | "view" = "view") {
    setDetailMode(mode);
    setActiveTaskId(taskId);
  }

  function handleQuickStatus(taskId: string, status: TaskStatus) {
    if (status === "done") {
      openTask(taskId, "complete");
      return;
    }
    void setTaskStatus(taskId, status);
  }

  function handlePriorityChange(taskId: string, priority: TaskPriority) {
    void setTaskPriority(taskId, priority);
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Today Focus</p>
            <h2>今日焦点</h2>
          </div>
        </div>
        <FocusList
          items={focusItems}
          onChangePriority={handlePriorityChange}
          onOpenTask={(taskId) => openTask(taskId, "view")}
          onRemoveTask={removeFocusTask}
          onUpdateStatus={handleQuickStatus}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Project Overview</p>
            <h2>项目总览</h2>
          </div>
          <button onClick={() => setIsCreatingProject(true)} type="button">
            + 新建项目
          </button>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              onOpen={(projectId) => navigate(`/projects/${projectId}`)}
              project={project}
              tasks={tasks}
            />
          ))}
        </div>
      </section>

      {isCreatingProject ? (
        <Modal onClose={() => setIsCreatingProject(false)} title="新建项目">
          <form className="modal__body" onSubmit={handleCreateProject}>
            <label className="field">
              <span>项目名称</span>
              <input
                autoFocus
                onChange={(event) => setProjectName(event.target.value)}
                value={projectName}
              />
            </label>
            <label className="field">
              <span>项目描述</span>
              <textarea
                onChange={(event) => setProjectDescription(event.target.value)}
                rows={4}
                value={projectDescription}
              />
            </label>
            <div className="modal__actions">
              <button
                className="ghost-button"
                onClick={() => setIsCreatingProject(false)}
                type="button"
              >
                取消
              </button>
              <button type="submit">创建项目</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {activeTask && activeTaskProject ? (
        <TaskDetailPanel
          onClose={() => {
            setActiveTaskId(null);
            setDetailMode("view");
          }}
          project={activeTaskProject}
          startCompletionFlow={detailMode === "complete"}
          taskId={activeTask.id}
        />
      ) : null}
    </div>
  );
}
