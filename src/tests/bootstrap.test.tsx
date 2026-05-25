import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { App } from "../app/App";
import { demoSnapshot } from "../lib/demo/demoSnapshot";
import { seedAppData } from "../lib/demo/seedAppData";
import { resetDatabase } from "../lib/storage/db";
import { focusRepository } from "../lib/storage/focusRepository";
import { projectRepository } from "../lib/storage/projectRepository";
import { reportRepository } from "../lib/storage/reportRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { useFocusStore } from "../features/focus/focusStore";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { renderWithRouter } from "./test-utils";

describe("App shell", () => {
  beforeEach(async () => {
    vi.useRealTimers();
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
    usePreferenceStore.setState({
      isLoaded: false,
      preferences: usePreferenceStore.getState().preferences,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders primary navigation for Home, Projects, and Reports", async () => {
    const todayLabel = new Intl.DateTimeFormat("zh-CN", {
      day: "numeric",
      month: "long",
      weekday: "long",
      year: "numeric",
    }).format(new Date());

    renderWithRouter(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Yibu" }),
    ).toBeInTheDocument();
    expect(screen.getByText(todayLabel)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Reports" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Today" }),
    ).toBeInTheDocument();
  });

  test("refreshes the header date when the app regains focus", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-18T23:59:00+08:00"));

    renderWithRouter(<App />);

    expect(screen.getByText("2026年5月18日星期一")).toBeInTheDocument();

    vi.setSystemTime(new Date("2026-05-19T00:01:00+08:00"));
    fireEvent.focus(window);

    expect(screen.getByText("2026年5月19日星期二")).toBeInTheDocument();
  });

  test("provides a shared seed source for browser and automation", async () => {
    await seedAppData();

    const projects = await projectRepository.list();
    const reports = await reportRepository.list();
    const taskIds = (await taskRepository.listAll()).map((task) => task.id);

    expect(projects.map((project) => project.name)).toEqual(
      expect.arrayContaining([
        "品牌升级",
        "产品体验收敛",
        "报告自动化",
        "数据安全与迁移",
        "移动端复核",
      ]),
    );
    expect(taskIds).toHaveLength(demoSnapshot.tasks.length);
    expect(taskIds).toEqual(
      expect.arrayContaining([
        "task-blocked",
        "task-complete",
        "task-long-title",
        "task-polish-focus-card",
      ]),
    );
    expect((await focusRepository.list()).map((focusRef) => focusRef.taskId)).toEqual([
      "task-long-title",
      "task-blocked",
      "task-complete",
      "task-polish-focus-card",
      "task-data-storage-consistency",
    ]);
    expect(reports.map((report) => report.id)).toEqual(
      expect.arrayContaining([
        "report-daily-2026-04-29",
        "report-weekly-2026-w18",
        "report-monthly-2026-04",
      ]),
    );
    expect(demoSnapshot.projects[0]?.name).toBe("品牌升级");
  });
});
