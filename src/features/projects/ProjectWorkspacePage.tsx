import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProjectWorkspaceSidebar } from "../../components/projects/ProjectWorkspaceSidebar";
import { TaskBoardView } from "../../components/tasks/TaskBoardView";
import { TaskDetailPanel } from "../../components/tasks/TaskDetailPanel";
import { TaskWorkspaceHeader } from "../../components/tasks/TaskWorkspaceHeader";
import { useToast } from "../../components/common/ToastProvider";
import { useProjectStore } from "./projectStore";
import { useFocusStore } from "../focus/focusStore";
import { useTaskStore } from "../tasks/taskStore";
import type { Task, TaskPriority, TaskStatus } from "../../types/task";

function HomeArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M10.75 19.25 4.5 13l6.25-6.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M5.25 13H19.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  const restoreTask = useTaskStore((state) => state.restoreTask);
  const setTaskPriority = useTaskStore((state) => state.setPriority);
  const setTaskStatus = useTaskStore((state) => state.setStatus);
  const addFocusTask = useFocusStore((state) => state.addTask);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const toggleFocusTask = useFocusStore((state) => state.toggleTask);
  const { showToast } = useToast();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const selectedProjectId = projectId ?? searchParams.get("project") ?? projects[0]?.id ?? null;
  const focusTaskIds = useMemo(
    () => focusRefs.map((reference) => reference.taskId),
    [focusRefs],
  );

  const project = useMemo(
    () => projects.find((item) => item.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const projectTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.projectId === selectedProjectId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [selectedProjectId, tasks],
  );

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <h2>还没有项目</h2>
        <p>返回首页创建项目后，再进入项目推进页。</p>
        <button onClick={() => navigate("/")} type="button">
          返回首页
        </button>
      </div>
    );
  }

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

  const currentProject = project;

  function openTask(taskId: string) {
    setActiveTaskId(taskId);
  }

  function handleQuickStatus(taskId: string, status: TaskStatus) {
    if (status === "done") {
      const taskBeforeCompletion = tasks.find((task) => task.id === taskId);
      void setTaskStatus(taskId, "done").then(() => {
        if (taskBeforeCompletion) {
          showToast({
            action: {
              label: "撤回",
              onClick: () => {
                void restoreTask(taskBeforeCompletion);
              },
            },
            message: "任务已完成",
          });
        }
      });
      return;
    }
    void setTaskStatus(taskId, status);
  }

  function handlePriorityChange(taskId: string, priority: TaskPriority) {
    void setTaskPriority(taskId, priority);
  }

  function selectProject(nextProjectId: string) {
    setActiveTaskId(null);
    void navigate(`/projects?project=${nextProjectId}`);
  }

  return (
    <div className="project-workspace project-workspace--split-pane">
      <aside className="project-workspace__sidebar-shell">
        <div className="project-workspace__sidebar-head">
          <button
            aria-label="返回首页"
            className="project-workspace__home-button"
            onClick={() => navigate("/")}
            title="返回首页"
            type="button"
          >
            <HomeArrowIcon />
          </button>
          <p className="project-workspace__section-label">PROJECT</p>
        </div>
        <ProjectWorkspaceSidebar
          currentProjectId={currentProject.id}
          onSelectProject={selectProject}
          projects={projects}
          tasks={tasks}
        />
      </aside>

      <div className="project-workspace__main">
        <div className="project-workspace__task-shell">
          <TaskWorkspaceHeader
            onCreateTask={async (input) => {
              await createTask({
                body: input.body,
                projectId: currentProject.id,
                title: input.title,
              });
              showToast({ message: "任务已创建" });
            }}
          />
          <TaskBoardView
            focusTaskIds={focusTaskIds}
            onChangePriority={handlePriorityChange}
            onOpenTask={openTask}
            onToggleFocus={(taskId) => {
              void toggleFocusTask(taskId);
            }}
            onUpdateStatus={handleQuickStatus}
            tasks={projectTasks}
          />
        </div>
      </div>

      {activeTaskId ? (
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
          project={currentProject}
          taskId={activeTaskId}
        />
      ) : null}

    </div>
  );
}
