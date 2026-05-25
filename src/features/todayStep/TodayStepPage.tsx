import { Check, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { exitTodayExecutionMode, openMainWindow } from "../../lib/desktop/windowCommands";
import { useFocusStore } from "../focus/focusStore";
import { usePreferenceStore } from "../preferences/preferenceStore";
import { useProjectStore } from "../projects/projectStore";
import { useTaskStore } from "../tasks/taskStore";
import { isTauriRuntime } from "../../lib/platform/runtime";
import { TODAY_STEP_REFRESH_EVENT } from "../../lib/desktop/windowCommands";
import { TASK_STATUS_LABELS } from "../../lib/constants";
import { getChecklistProgress } from "../../types/task";
import type { Task } from "../../types/task";

const MAX_FOCUS_TASKS = 5;

function isTask(task: Task | undefined): task is Task {
  return Boolean(task);
}

function WindowModeIcon({ direction }: { direction: "enter" | "exit" }) {
  return (
    <svg
      aria-hidden="true"
      className={`window-mode-icon window-mode-icon--${direction}`}
      viewBox="0 0 18 18"
    >
      <rect className="window-mode-icon__frame" height="12" rx="2.6" width="15" x="1.5" y="3" />
      <path className="window-mode-icon__divider" d="M7 3.8v10.4" />
      <path className="window-mode-icon__arrow" d="M12.6 6.2 15 9l-2.4 2.8" />
      <path className="window-mode-icon__arrow" d="M8.8 9H15" />
    </svg>
  );
}

export function TodayStepPage() {
  const navigate = useNavigate();
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const loadFocus = useFocusStore((state) => state.loadFocus);
  const removeFocusTask = useFocusStore((state) => state.removeTask);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const projects = useProjectStore((state) => state.projects);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const tasks = useTaskStore((state) => state.tasks);
  const setStatus = useTaskStore((state) => state.setStatus);
  const toggleChecklistItem = useTaskStore((state) => state.toggleChecklistItem);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const refreshTodayStepData = useCallback(async () => {
    await Promise.all([loadProjects(), loadTasks(), loadFocus()]);
  }, [loadFocus, loadProjects, loadTasks]);

  useEffect(() => {
    void refreshTodayStepData();
  }, [refreshTodayStepData]);

  useEffect(() => {
    if (!isTauriRuntime()) {
      return undefined;
    }

    let unlistenRefresh: (() => void) | undefined;
    void import("@tauri-apps/api/event").then(({ listen }) => {
      void listen(TODAY_STEP_REFRESH_EVENT, () => {
        void refreshTodayStepData();
      }).then((unlisten) => {
        unlistenRefresh = unlisten;
      });
    });

    function handleWindowFocus() {
      void refreshTodayStepData();
    }

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      unlistenRefresh?.();
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refreshTodayStepData]);

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const focusedTasks = useMemo(
    () =>
      [...focusRefs]
        .sort((first, second) => {
          const orderDelta = (first.order ?? 0) - (second.order ?? 0);
          return orderDelta === 0 ? first.addedAt.localeCompare(second.addedAt) : orderDelta;
        })
        .map((reference) => taskById.get(reference.taskId))
        .filter(isTask)
        .filter((task) => task.status !== "done")
        .slice(0, MAX_FOCUS_TASKS),
    [focusRefs, taskById],
  );
  async function completeTask(taskId: string) {
    setBusyTaskId(taskId);
    try {
      await setStatus(taskId, "done");
      await removeFocusTask(taskId);
    } finally {
      setBusyTaskId(null);
    }
  }

  async function startTodayWindowDrag(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest("button, a, input, textarea, select, [data-no-window-drag]") ||
      !isTauriRuntime()
    ) {
      return;
    }

    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const currentWindow = getCurrentWindow();
    if (currentWindow.label === "today-step") {
      await currentWindow.startDragging();
    }
  }

  async function returnToMainWindow() {
    const result = await exitTodayExecutionMode();
    if (result.path) {
      navigate(result.path);
    }
  }

  async function openTaskInMainWindow(task: Task) {
    const result = await exitTodayExecutionMode({ projectId: task.projectId, taskId: task.id });
    if (result.path) {
      navigate(result.path);
    }
  }

  return (
    <section className="today-step" aria-label="今日">
      <div
        className="today-step-titlebar"
        data-tauri-drag-region
        onPointerDown={(event) => {
          void startTodayWindowDrag(event);
        }}
      />
      <div className="today-step-top-controls" aria-label="今日执行控制">
        <button
          aria-label="回到主窗口"
          className="today-step-icon-button today-step-icon-button--mode"
          data-no-window-drag
          onClick={() => {
            void returnToMainWindow();
          }}
          title="回到主窗口"
          type="button"
        >
          <WindowModeIcon direction="exit" />
        </button>
      </div>

      <header className="today-step__header">
        <div>
          <h1 aria-label="今日">今日 <span className="today-step__count" aria-label={`${focusedTasks.length} 个焦点任务`}>{focusedTasks.length}</span></h1>
        </div>
      </header>

      {focusedTasks.length === 0 ? (
        <div className="today-step__empty">
          <strong>今天还没有焦点任务</strong>
          <span>从一步里把任务加入今日。</span>
          <button
            aria-label="打开一步主窗口"
            className="today-step-empty-action"
            onClick={() => {
              void openMainWindow();
            }}
            type="button"
          >
            返回一步
          </button>
        </div>
      ) : (
        <div className="today-step__list" aria-label="今日焦点列表">
          {focusedTasks.map((task) => {
            const project = projectById.get(task.projectId);
            const progress = getChecklistProgress(task);
            const isBusy = busyTaskId === task.id;
            const pendingChecklistItems = task.checklist.filter((item) => !item.done);
            const previewItems = pendingChecklistItems.slice(0, 2);

            return (
              <article
                aria-label={`今日任务：${task.title}`}
                className={`today-step-task today-step-task--${task.status}`}
                key={task.id}
                role="group"
              >
                <div className="today-step-task__meta">
                  <span>{project?.name ?? "无项目"}</span>
                  <span className={`today-step-task__status today-step-task__status--${task.status}`}>
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
                <h2 title={task.title}>{task.title}</h2>
                <div className="today-step-task__progress">
                  <span>
                    {progress.completed}/{progress.total}
                  </span>
                  <span>{progress.total > 0 ? "清单" : "无清单"}</span>
                </div>
                {task.checklist.length > 0 ? (
                  <ul className="today-step-checklist" aria-label="清单预览">
                    {previewItems.map((item) => (
                      <li key={item.id}>
                        <button
                          aria-label={`${item.done ? "取消勾选" : "勾选"}${item.text}`}
                          className="today-step-checklist__toggle"
                          onClick={() => {
                            void toggleChecklistItem(task.id, item.id);
                          }}
                          type="button"
                        >
                          {item.done ? <Check aria-hidden="true" strokeWidth={2.2} /> : null}
                        </button>
                        <span title={item.text}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="today-step-task__actions">
                  <button
                    aria-label={`完成任务：${task.title}`}
                    className="today-step-task-action today-step-task-action--complete"
                    disabled={isBusy}
                    onClick={() => {
                      void completeTask(task.id);
                    }}
                    title="完成任务"
                    type="button"
                  >
                    <Check aria-hidden="true" strokeWidth={2.1} />
                  </button>
                  <button
                    aria-label={`打开任务：${task.title}`}
                    className="today-step-task-action today-step-task-action--open"
                    onClick={() => {
                      void openTaskInMainWindow(task);
                    }}
                    title="打开任务"
                    type="button"
                  >
                    <ExternalLink aria-hidden="true" strokeWidth={1.9} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
