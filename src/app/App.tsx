import { NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "../features/home/HomePage";
import { ProjectWorkspacePage } from "../features/projects/ProjectWorkspacePage";
import { ReportCenterPage } from "../features/reports/ReportCenterPage";
import { useAppBootstrap } from "./useAppBootstrap";

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

export function App() {
  const { ready } = useAppBootstrap();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__intro">
          <p className="eyebrow">Desk Journal</p>
          <h1>Personal To-do</h1>
          <p className="app-header__summary">
            Project-driven personal work cockpit for focused execution and
            saved reporting.
          </p>
        </div>
        <nav aria-label="Primary" className="app-nav">
          <NavLink
            className={({ isActive }) =>
              isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
            }
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
            }
            to="/reports"
          >
            Report Center
          </NavLink>
        </nav>
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
          <Route
            element={<HomePage />}
            path="/"
          />
          <Route
            element={<ReportCenterPage />}
            path="/reports"
          />
          <Route
            element={<ProjectWorkspacePage />}
            path="/projects/:projectId"
          />
        </Routes>
        )}
      </main>
    </div>
  );
}
