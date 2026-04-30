import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { SettingsDialog } from "../features/settings/SettingsDialog";
import { ToastProvider } from "../components/common/ToastProvider";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { ProjectWorkspacePage } from "../features/projects/ProjectWorkspacePage";
import { ReportCenterPage } from "../features/reports/ReportCenterPage";
import { useAppBootstrap } from "./useAppBootstrap";
import { useEffect, useMemo, useState } from "react";

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

function SunIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4V2.5M12 21.5V20M4 12H2.5M21.5 12H20M6.34 6.34 5.28 5.28M18.72 18.72l-1.06-1.06M17.66 6.34l1.06-1.06M5.28 18.72l1.06-1.06"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 16.25A4.25 4.25 0 1 0 12 7.75a4.25 4.25 0 0 0 0 8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 14.2A7.9 7.9 0 0 1 9.8 4 8.2 8.2 0 1 0 20 14.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function App() {
  const { ready } = useAppBootstrap();
  const location = useLocation();
  const preferences = usePreferenceStore((state) => state.preferences);
  const savePreferences = usePreferenceStore((state) => state.savePreferences);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const isProjectWorkspace = location.pathname.startsWith("/projects");
  const shellClassName = useMemo(() => {
    const routeModifier = isProjectWorkspace ? " app-shell--project-workspace" : "";
    return `app-shell app-shell--${preferences.theme}${routeModifier}`;
  }, [isProjectWorkspace, preferences.theme]);
  const nextTheme = preferences.theme === "light" ? "dark" : "light";

  return (
    <ToastProvider>
      <div className={shellClassName}>
        <header className="app-header">
          <div className="app-header__intro">
            <p className="app-header__date">{todayLabel}</p>
            <h1>Personal To-do</h1>
          </div>
          <div className="app-header__actions">
            <nav aria-label="Primary" className="app-nav">
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
            </nav>
            <div aria-label="Global tools" className="app-tools" role="group">
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
                {preferences.theme === "light" ? <MoonIcon /> : <SunIcon />}
              </button>
              <button
                aria-label="设置"
                className="app-tool-button"
                data-tooltip="设置"
                onClick={() => setIsSettingsOpen(true)}
                title="设置"
                type="button"
              >
                Settings
              </button>
            </div>
          </div>
        </header>

        <main className="app-main">
          {!ready ? (
            <section className="placeholder-page" aria-label="Loading">
              <p className="eyebrow">Bootstrapping</p>
              <h2>正在载入工作台</h2>
              <p>正在准备项目、任务、今日焦点和报告数据。</p>
            </section>
          ) : (
            <Routes>
              <Route element={<HomePage />} path="/" />
              <Route element={<ReportCenterPage />} path="/reports" />
              <Route element={<ProjectWorkspacePage />} path="/projects" />
              <Route element={<ProjectWorkspacePage />} path="/projects/:projectId" />
            </Routes>
          )}
        </main>

        {isSettingsOpen ? <SettingsDialog onClose={() => setIsSettingsOpen(false)} /> : null}
      </div>
    </ToastProvider>
  );
}
