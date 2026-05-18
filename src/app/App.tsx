import { ListTodo, Moon, Sun } from "lucide-react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { ToastProvider } from "../components/common/ToastProvider";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { ProjectWorkspacePage } from "../features/projects/ProjectWorkspacePage";
import { ReportCenterPage } from "../features/reports/ReportCenterPage";
import { TodayStepHandlePage } from "../features/todayStep/TodayStepHandlePage";
import { TodayStepPage } from "../features/todayStep/TodayStepPage";
import { useAppBootstrap } from "./useAppBootstrap";
import { useEffect, useMemo, type PointerEvent } from "react";
import { useDesktopShortcuts } from "../lib/desktop/useDesktopShortcuts";
import { isTauriRuntime } from "../lib/platform/runtime";
import {
  TODAY_STEP_OPEN_TASK_EVENT,
  enterTodayExecutionMode,
  type MainWindowOpenTarget,
} from "../lib/desktop/windowCommands";

function PlaceholderPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="placeholder-page" aria-label={title}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
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

export function App() {
  const { ready } = useAppBootstrap();
  const location = useLocation();
  const navigate = useNavigate();
  const preferences = usePreferenceStore((state) => state.preferences);
  const savePreferences = usePreferenceStore((state) => state.savePreferences);
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        day: "numeric",
        month: "long",
        weekday: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.style.colorScheme = preferences.theme;
    document.documentElement.style.setProperty("--lane-task", preferences.laneColors.task);
    document.documentElement.style.setProperty("--lane-doing", preferences.laneColors.doing);
    document.documentElement.style.setProperty("--lane-done", preferences.laneColors.done);
  }, [preferences]);

  useEffect(() => {
    if (!isTauriRuntime()) {
      return undefined;
    }

    let unlisten: (() => void) | undefined;
    void Promise.all([
      import("@tauri-apps/api/event"),
      import("@tauri-apps/api/window"),
    ]).then(([{ listen }, { getCurrentWindow }]) => {
      if (getCurrentWindow().label !== "main") {
        return;
      }

      void listen<MainWindowOpenTarget>(TODAY_STEP_OPEN_TASK_EVENT, (event) => {
        if (event.payload.projectId) {
          navigate(`/projects/${event.payload.projectId}`);
        } else {
          navigate("/");
        }
      }).then((nextUnlisten) => {
        unlisten = nextUnlisten;
      });
    });

    return () => {
      unlisten?.();
    };
  }, [navigate]);

  useEffect(() => {
    if (
      !isTauriRuntime() ||
      location.pathname === "/today-step" ||
      location.pathname === "/today-step-handle"
    ) {
      return;
    }

    void import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      const currentWindow = getCurrentWindow();
      if (currentWindow.label === "today-step") {
        navigate("/today-step", { replace: true });
      } else if (currentWindow.label === "today-step-handle") {
        navigate("/today-step-handle", { replace: true });
      }
    });
  }, [location.pathname, navigate]);

  const isTodayStep = location.pathname === "/today-step";
  const isTodayStepHandle = location.pathname === "/today-step-handle";
  const isLegacyTodayStep = location.pathname === "/quick-step";
  const isProjectWorkspace = location.pathname.startsWith("/projects");
  const shellClassName = useMemo(() => {
    const routeModifier = isProjectWorkspace ? " app-shell--project-workspace" : "";
    return `app-shell app-shell--${preferences.theme}${routeModifier}`;
  }, [isProjectWorkspace, preferences.theme]);
  const nextTheme = preferences.theme === "light" ? "dark" : "light";
  async function openTodayExecution() {
    if (preferences.todayStepDocked) {
      void savePreferences({ todayStepDocked: false });
    }
    const enteredInlineMode = await enterTodayExecutionMode(location.pathname);
    if (enteredInlineMode) {
      navigate("/today-step");
    }
  }

  async function startMainWindowDrag(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest("button, a, input, textarea, select, [data-no-window-drag]") ||
      !isTauriRuntime()
    ) {
      return;
    }

    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const currentWindow = getCurrentWindow();
    if (currentWindow.label === "main") {
      await currentWindow.startDragging();
    }
  }

  useDesktopShortcuts({
    onNew: () => {
      window.dispatchEvent(new CustomEvent("personal-todo:new-primary"));
    },
    onOpenSettings: () => {
      void navigate("/settings");
    },
    onOpenTodayStep: () => {
      void openTodayExecution();
    },
    todayStepShortcut: preferences.todayStepShortcut,
  });

  if (isTodayStepHandle) {
    return (
      <ToastProvider>
        {ready ? (
          <TodayStepHandlePage />
        ) : (
          <main className="today-step-handle-shell">
            <button className="today-step-edge-handle" disabled type="button">
              <span className="today-step-edge-handle__mark"><ListTodo aria-hidden="true" strokeWidth={2} /></span>
              <span className="today-step-edge-handle__label">今日</span>
              <strong>0</strong>
              <span className="today-step-edge-handle__grip" aria-hidden="true"><span /><span /><span /></span>
            </button>
          </main>
        )}
      </ToastProvider>
    );
  }

  if (isTodayStep || isLegacyTodayStep) {
    return (
      <ToastProvider>
        <main className="today-step-shell">
          {!ready ? (
            <section className="today-step" aria-label="Loading">
              <p className="today-step__eyebrow">启动中</p>
              <h1>今日</h1>
              <div className="today-step__empty">正在准备工作区。</div>
            </section>
          ) : (
            <Routes>
              <Route element={<TodayStepPage />} path="/today-step" />
              <Route element={<Navigate replace to="/today-step" />} path="/quick-step" />
            </Routes>
          )}
        </main>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className={shellClassName}>
        <div
          className="app-titlebar"
          data-tauri-drag-region
          onPointerDown={(event) => {
            void startMainWindowDrag(event);
          }}
        >
          <button
            aria-label="开启今日执行"
            className="app-titlebar__today-button"
            data-no-window-drag
            data-tooltip={`今日执行 ${preferences.todayStepShortcut}`}
            onClick={() => {
              void openTodayExecution();
            }}
            title={`开启今日执行：${preferences.todayStepShortcut}`}
            type="button"
          >
            <WindowModeIcon direction="enter" />
          </button>
        </div>
        <header className="app-header">
          <div className="app-header__intro">
            <p className="app-header__date">{todayLabel}</p>
            <h1>Yibu</h1>
          </div>
          <div className="app-header__actions">
            <nav aria-label="Primary" className="app-nav">
              <button
                aria-label={preferences.theme === "light" ? "深色" : "浅色"}
                className="app-tool-button app-theme-toggle"
                data-tooltip={preferences.theme === "light" ? "深色" : "浅色"}
                onClick={() => {
                  void savePreferences({ theme: nextTheme });
                }}
                title={preferences.theme === "light" ? "深色" : "浅色"}
                type="button"
              >
                {preferences.theme === "light" ? <Moon aria-hidden="true" strokeWidth={1.9} /> : <Sun aria-hidden="true" strokeWidth={1.9} />}
              </button>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
                }
                end
                title="首页"
                to="/"
              >
                Home
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
                }
                title="项目"
                to="/projects"
              >
                Projects
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
                }
                title="报告"
                to="/reports"
              >
                Reports
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
                }
                title="设置"
                to="/settings"
              >
                Settings
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="app-main">
          {!ready ? (
            <section className="placeholder-page" aria-label="Loading">
              <p className="eyebrow">Bootstrapping</p>
              <h2>Loading workspace</h2>
              <p>Preparing projects, tasks, today list, and reports.</p>
            </section>
          ) : (
            <Routes>
              <Route element={<HomePage />} path="/" />
              <Route element={<ReportCenterPage />} path="/reports" />
              <Route element={<SettingsPage />} path="/settings" />
              <Route element={<ProjectWorkspacePage />} path="/projects" />
              <Route element={<ProjectWorkspacePage />} path="/projects/:projectId" />
              <Route element={<TodayStepPage />} path="/today-step" />
              <Route element={<TodayStepHandlePage />} path="/today-step-handle" />
              <Route element={<Navigate replace to="/today-step" />} path="/quick-step" />
            </Routes>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
