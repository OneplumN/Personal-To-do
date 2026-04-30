import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../focus/focusStore";
import { useProjectStore } from "../projects/projectStore";
import { useTaskStore } from "../tasks/taskStore";
import { FocusList } from "../../components/focus/FocusList";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { Modal } from "../../components/common/Modal";
import { TaskDetailPanel } from "../../components/tasks/TaskDetailPanel";
import { useToast } from "../../components/common/ToastProvider";
import type { TaskPriority, TaskStatus } from "../../types/task";

function ProjectCreateCancelIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 7 10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="m17 7-10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function ProjectCreateConfirmIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const tasks = useTaskStore((state) => state.tasks);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const restoreTask = useTaskStore((state) => state.restoreTask);
  const setTaskPriority = useTaskStore((state) => state.setPriority);
  const setTaskStatus = useTaskStore((state) => state.setStatus);
  const addFocusTask = useFocusStore((state) => state.addTask);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const removeFocusTask = useFocusStore((state) => state.removeTask);
  const reorderFocusTask = useFocusStore((state) => state.reorderTask);
  const { showToast } = useToast();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingProjectDescription, setEditingProjectDescription] = useState("");
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
  const editingProject = editingProjectId
    ? projects.find((project) => project.id === editingProjectId) ?? null
    : null;

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
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
    showToast({ message: "项目已创建" });
    navigate(`/projects?project=${project.id}`);
  }

  function openProjectEditor(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
    setEditingProjectDescription(project.description);
  }

  async function handleUpdateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProject || !editingProjectName.trim()) {
      return;
    }

    await updateProject(editingProject.id, {
      description: editingProjectDescription.trim(),
      name: editingProjectName.trim(),
    });
    setEditingProjectId(null);
    setEditingProjectName("");
    setEditingProjectDescription("");
    showToast({ message: "项目已保存" });
  }

  function openTask(taskId: string) {
    setActiveTaskId(taskId);
  }

  function handleQuickStatus(taskId: string, status: TaskStatus) {
    if (status === "done") {
      void setTaskStatus(taskId, "done").then(() => {
        void removeFocusTask(taskId);
        showToast({
          action: {
            label: "撤回",
            onClick: async () => {
              await setTaskStatus(taskId, "blocked");
              await addFocusTask(taskId);
              await loadTasks();
            },
          },
          message: "任务已完成",
        });
      });
      return;
    }
    void setTaskStatus(taskId, status);
  }

  function handlePriorityChange(taskId: string, priority: TaskPriority) {
    void setTaskPriority(taskId, priority);
  }

  return (
    <div className="dashboard-page dashboard-page--home">
      <section className="dashboard-section dashboard-section--focus">
        <div className="section-heading">
          <div>
            <h2>今日焦点</h2>
          </div>
        </div>
        <FocusList
          items={focusItems}
          onChangePriority={handlePriorityChange}
          onOpenTask={openTask}
          onRemoveTask={(taskId) => {
            void removeFocusTask(taskId).then(() => {
              showToast({
                action: {
                  label: "撤回",
                  onClick: () => addFocusTask(taskId),
                },
                message: "任务已移出今日焦点",
              });
            });
          }}
          onReorder={(taskId, toIndex) => {
            void reorderFocusTask(taskId, toIndex);
          }}
          onUpdateStatus={(taskId) => {
            handleQuickStatus(taskId, "done");
          }}
        />
      </section>

      <section className="dashboard-section dashboard-section--projects">
        <div className="section-heading">
          <div>
            <h2>项目总览</h2>
          </div>
          <button
            aria-label="新建项目"
            className="icon-button icon-action icon-action--success project-create-action"
            onClick={() => setIsCreatingProject(true)}
            title="新建项目"
            type="button"
          >
            +
          </button>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              onEdit={openProjectEditor}
              onOpen={(projectId) => navigate(`/projects?project=${projectId}`)}
              project={project}
              tasks={tasks}
            />
          ))}
        </div>
      </section>

      {isCreatingProject ? (
        <Modal
          className="project-create-modal"
          onClose={() => setIsCreatingProject(false)}
          title="新建项目"
        >
          <form className="modal__body project-create-modal__form" onSubmit={handleCreateProject}>
            <label className="field">
              <span>项目名称</span>
              <input
                autoFocus
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="例如：品牌升级"
                value={projectName}
              />
            </label>
            <label className="field">
              <span>项目描述</span>
              <textarea
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="可选"
                rows={4}
                value={projectDescription}
              />
            </label>
            <div className="modal__actions project-create-modal__actions">
              <button
                aria-label="取消新建项目"
                className="icon-button icon-action icon-action--danger"
                onClick={() => setIsCreatingProject(false)}
                title="取消"
                type="button"
              >
                <ProjectCreateCancelIcon />
              </button>
              <button
                aria-label="创建项目"
                className="icon-button icon-action icon-action--success"
                title="创建项目"
                type="submit"
              >
                <ProjectCreateConfirmIcon />
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editingProject ? (
        <Modal
          className="project-create-modal project-edit-modal"
          onClose={() => setEditingProjectId(null)}
          title="编辑项目"
        >
          <form className="modal__body project-create-modal__form" onSubmit={handleUpdateProject}>
            <label className="field">
              <span>项目名称</span>
              <input
                autoFocus
                onChange={(event) => setEditingProjectName(event.target.value)}
                value={editingProjectName}
              />
            </label>
            <label className="field">
              <span>项目笔记</span>
              <textarea
                onChange={(event) => setEditingProjectDescription(event.target.value)}
                placeholder="可选"
                rows={4}
                value={editingProjectDescription}
              />
            </label>
            <div className="modal__actions project-create-modal__actions">
              <button
                aria-label="取消编辑项目"
                className="icon-button icon-action icon-action--danger"
                onClick={() => setEditingProjectId(null)}
                title="取消"
                type="button"
              >
                <ProjectCreateCancelIcon />
              </button>
              <button
                aria-label="保存项目"
                className="icon-button icon-action icon-action--success"
                title="保存项目"
                type="submit"
              >
                <ProjectCreateConfirmIcon />
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {activeTask && activeTaskProject ? (
        <TaskDetailPanel
          onClose={() => {
            setActiveTaskId(null);
          }}
          onDeleted={(payload) => {
            showToast({
              action: {
                label: "撤回",
                onClick: () => {
                  void restoreTask(payload.task).then(() => {
                    if (payload.wasInFocus) {
                      void addFocusTask(payload.task.id);
                    }
                  });
                },
              },
              message: "任务已删除",
            });
          }}
          onSaved={() => {
            showToast({ message: "已保存" });
          }}
          project={activeTaskProject}
          taskId={activeTask.id}
        />
      ) : null}
    </div>
  );
}
