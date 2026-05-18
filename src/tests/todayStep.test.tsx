import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { App } from "../app/App";
import { useFocusStore } from "../features/focus/focusStore";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { DEFAULT_PREFERENCES } from "../lib/constants";
import { focusRepository } from "../lib/storage/focusRepository";
import { resetDatabase } from "../lib/storage/db";
import { projectRepository } from "../lib/storage/projectRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { createProject } from "../types/project";
import { createChecklistItem, createTask } from "../types/task";
import { renderWithRouter } from "./test-utils";

const windowCommandMocks = vi.hoisted(() => ({
  enterTodayExecutionMode: vi.fn(),
  exitTodayExecutionMode: vi.fn(),
  openMainWindow: vi.fn(),
  setTodayStepDocked: vi.fn(),
  snapTodayStepHandleWindow: vi.fn(),
  showTodayStepWindow: vi.fn(),
  startTodayStepHandleDrag: vi.fn(),
}));

vi.mock("../lib/desktop/windowCommands", () => windowCommandMocks);

describe("Today Step", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.clearAllMocks();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    usePreferenceStore.setState({ isLoaded: false, preferences: DEFAULT_PREFERENCES });
    windowCommandMocks.enterTodayExecutionMode.mockResolvedValue(true);
    windowCommandMocks.exitTodayExecutionMode.mockResolvedValue({ path: "/", restored: true });
    windowCommandMocks.openMainWindow.mockResolvedValue(undefined);
    windowCommandMocks.setTodayStepDocked.mockResolvedValue(undefined);
    windowCommandMocks.snapTodayStepHandleWindow.mockResolvedValue(undefined);
    windowCommandMocks.showTodayStepWindow.mockResolvedValue(undefined);
    windowCommandMocks.startTodayStepHandleDrag.mockResolvedValue(undefined);
  });

  test("renders a compact today step route", async () => {
    renderWithRouter(<App />, { route: "/today-step" });

    expect(await screen.findByRole("heading", { name: "今日" })).toBeInTheDocument();
    expect(await screen.findByText("今天还没有焦点任务")).toBeInTheDocument();
    expect(screen.getByText("从一步里把任务加入今日。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "返回一步" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "打开一步主窗口" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
  });

  test("returns from today execution to the main workspace", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: "/today-step" });

    await user.click(await screen.findByRole("button", { name: "回到主窗口" }));

    expect(windowCommandMocks.exitTodayExecutionMode).toHaveBeenCalledWith();
  });

  test("keeps the edge handle action out of the today execution window", async () => {
    renderWithRouter(<App />, { route: "/today-step" });

    expect(await screen.findByText("今天还没有焦点任务")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "收起今日执行" })).not.toBeInTheDocument();
  });

  test("shows today focus and hides non-focused tasks", async () => {
    const project = createProject({ name: "Product Polish" }, "2026-05-12T08:00:00.000Z");
    const focusedTask = {
      ...createTask(
        { projectId: project.id, title: "Review floating focus" },
        "2026-05-12T08:05:00.000Z",
      ),
      checklist: [
        createChecklistItem("Check compact title"),
        createChecklistItem("Verify action row"),
        createChecklistItem("Open main window"),
        createChecklistItem("Keep overflow quiet"),
      ],
      status: "in_progress" as const,
    };
    const otherTask = createTask(
      { projectId: project.id, title: "Hidden backlog task" },
      "2026-05-12T08:10:00.000Z",
    );

    await projectRepository.save(project);
    await taskRepository.save(focusedTask);
    await taskRepository.save(otherTask);
    await focusRepository.add({
      addedAt: "2026-05-12T08:15:00.000Z",
      order: 0,
      taskId: focusedTask.id,
    });

    renderWithRouter(<App />, { route: "/today-step" });

    const item = await screen.findByRole("group", { name: "今日任务：Review floating focus" });
    expect(item).toHaveTextContent("Product Polish");
    expect(item).toHaveTextContent("0/4");
    expect(item).toHaveTextContent("Check compact title");
    expect(item).toHaveTextContent("Verify action row");
    expect(item).toHaveTextContent("还有 2 项");
    expect(item).not.toHaveTextContent("Open main window");
    expect(screen.queryByText("Hidden backlog task")).not.toBeInTheDocument();
  });

  test("opens the main app from a focused task action", async () => {
    const project = createProject({ name: "Launch" }, "2026-05-12T09:00:00.000Z");
    const task = createTask(
      { projectId: project.id, title: "Open full workspace" },
      "2026-05-12T09:05:00.000Z",
    );
    await projectRepository.save(project);
    await taskRepository.save(task);
    await focusRepository.add({
      addedAt: "2026-05-12T09:10:00.000Z",
      taskId: task.id,
    });

    const user = userEvent.setup();
    renderWithRouter(<App />, { route: "/today-step" });

    await screen.findByRole("group", { name: "今日任务：Open full workspace" });
    windowCommandMocks.exitTodayExecutionMode.mockResolvedValue({
      path: `/projects/${project.id}?task=${task.id}`,
      restored: true,
    });
    await user.click(screen.getByRole("button", { name: "打开任务：Open full workspace" }));

    expect(windowCommandMocks.exitTodayExecutionMode).toHaveBeenCalledWith({
      projectId: project.id,
      taskId: task.id,
    });
  });

  test("completes a focused task", async () => {
    const project = createProject({ name: "Daily" }, "2026-05-12T10:00:00.000Z");
    const task = createTask(
      { projectId: project.id, title: "Ship the today step slice" },
      "2026-05-12T10:05:00.000Z",
    );
    await projectRepository.save(project);
    await taskRepository.save(task);
    await focusRepository.add({
      addedAt: "2026-05-12T10:10:00.000Z",
      taskId: task.id,
    });

    const user = userEvent.setup();
    renderWithRouter(<App />, { route: "/today-step" });

    const item = await screen.findByRole("group", { name: "今日任务：Ship the today step slice" });
    await user.click(
      within(item).getByRole("button", { name: "完成任务：Ship the today step slice" }),
    );

    await waitFor(() => {
      expect(useTaskStore.getState().tasks.find((entry) => entry.id === task.id)?.status).toBe(
        "done",
      );
    });
    await waitFor(() => {
      expect(screen.queryByRole("group", { name: "今日任务：Ship the today step slice" })).not.toBeInTheDocument();
      expect(screen.getByText("今天还没有焦点任务")).toBeInTheDocument();
    });
  });

  test("shows a compact checklist preview inside the today step window", async () => {
    const project = createProject({ name: "Checklist" }, "2026-05-12T11:00:00.000Z");
    const task = {
      ...createTask(
        { projectId: project.id, title: "Review hidden checklist items" },
        "2026-05-12T11:05:00.000Z",
      ),
      checklist: [
        createChecklistItem("First visible item"),
        createChecklistItem("Second visible item"),
        createChecklistItem("Third visible item"),
        createChecklistItem("Fourth hidden item"),
        createChecklistItem("Fifth hidden item"),
      ],
    };
    await projectRepository.save(project);
    await taskRepository.save(task);
    await focusRepository.add({
      addedAt: "2026-05-12T11:10:00.000Z",
      taskId: task.id,
    });

    renderWithRouter(<App />, { route: "/today-step" });

    const item = await screen.findByRole("group", {
      name: "今日任务：Review hidden checklist items",
    });
    expect(item).toHaveTextContent("First visible item");
    expect(item).toHaveTextContent("Second visible item");
    expect(item).toHaveTextContent("还有 3 项");
    expect(item).not.toHaveTextContent("Fourth hidden item");
  });
});
