import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { App } from "../app/App";
import { focusRepository } from "../lib/storage/focusRepository";
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

describe("Home dashboard", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
  });

  test("renders Today Focus and project overview cards", async () => {
    const project = createProject({ name: "Project Alpha" }, "2026-04-23T08:00:00.000Z");
    const task = createTask(
      { projectId: project.id, title: "设计首页摘要" },
      "2026-04-23T08:05:00.000Z",
    );
    const completed = completeTask(
      createTask(
        { projectId: project.id, title: "完成接口梳理" },
        "2026-04-23T08:10:00.000Z",
      ),
      {
        keyChanges: "整理字段",
        notes: "",
        summary: "接口梳理完成",
      },
      "2026-04-23T09:00:00.000Z",
    );

    await projectRepository.save(project);
    await taskRepository.save({ ...task, status: "in_progress" });
    await taskRepository.save(completed);
    await focusRepository.add({
      addedAt: "2026-04-23T08:15:00.000Z",
      taskId: task.id,
    });

    renderWithRouter(<App />);

    await screen.findByRole("heading", { level: 2, name: "今日焦点" });
    expect(screen.getAllByText("Project Alpha")).toHaveLength(2);
    expect(screen.getByText("设计首页摘要")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("最近完成：")).toBeInTheDocument();
      expect(screen.getByText("完成接口梳理")).toBeInTheDocument();
    });
  });
});
