import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { App } from "../app/App";
import { resetDatabase } from "../lib/storage/db";
import { projectRepository } from "../lib/storage/projectRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { useFocusStore } from "../features/focus/focusStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { createProject } from "../types/project";
import { completeTask, createTask } from "../types/task";
import { renderWithRouter } from "./test-utils";

describe("Report Center", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
  });

  test("generates reports from completed tasks only and saves editable records", async () => {
    const now = Date.now();
    const createdAt = new Date(now - 60 * 60 * 1000).toISOString();
    const completedAt = new Date(now - 30 * 60 * 1000).toISOString();
    const project = createProject({ name: "Project Delta" }, createdAt);
    const completed = completeTask(
      createTask(
        { projectId: project.id, title: "完成日报结构" },
        createdAt,
      ),
      {
        keyChanges: "增加概览区",
        notes: "后续补月报模板",
        summary: "日报结构完成",
      },
      completedAt,
    );
    const inProgress = {
      ...createTask(
        { projectId: project.id, title: "进行中的任务" },
        createdAt,
      ),
      status: "in_progress" as const,
    };

    await projectRepository.save(project);
    await taskRepository.save(completed);
    await taskRepository.save(inProgress);

    const user = userEvent.setup();
    renderWithRouter(<App />, { route: "/reports" });

    await screen.findByRole("heading", { level: 2, name: "报告中心" });
    await user.click(screen.getByRole("button", { name: "生成日报" }));

    await waitFor(() => {
      expect(
        (screen.getByLabelText("报告标题") as HTMLInputElement).value,
      ).toMatch(/日报/);
      expect(
        (screen.getByLabelText("完成事项") as HTMLTextAreaElement).value,
      ).toMatch(/完成日报结构/);
    });

    expect(screen.getByText(/来源任务 1 条/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(/进行中的任务/)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("报告标题"));
    await user.type(screen.getByLabelText("报告标题"), "日报 · 手动修改");
    await user.click(screen.getByRole("button", { name: "保存报告" }));

    await waitFor(() => {
      expect(useReportStore.getState().reports[0]?.title).toBe("日报 · 手动修改");
    });
  });
});
