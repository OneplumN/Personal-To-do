import { screen } from "@testing-library/react";
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
import { createTask } from "../types/task";
import { renderWithRouter } from "./test-utils";

describe("Project workspace", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
  });

  test("renders summary and supports list/board toggle", async () => {
    const project = createProject({ name: "Project Beta" }, "2026-04-23T08:00:00.000Z");
    await projectRepository.save(project);
    await taskRepository.save(
      createTask({ projectId: project.id, title: "准备任务列表" }, "2026-04-23T08:10:00.000Z"),
    );

    const user = userEvent.setup();
    renderWithRouter(<App />, {
      route: `/projects/${project.id}`,
    });

    await screen.findByRole("heading", { level: 2, name: "Project Beta" });
    expect(screen.getByText("任务工作区")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "看板" }));

    expect(screen.getByRole("heading", { level: 3, name: "待做" })).toBeInTheDocument();
  });
});
