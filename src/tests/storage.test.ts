import { beforeEach, describe, expect, test } from "vitest";
import { focusRepository } from "../lib/storage/focusRepository";
import { preferenceRepository } from "../lib/storage/preferenceRepository";
import { projectRepository } from "../lib/storage/projectRepository";
import { reportRepository } from "../lib/storage/reportRepository";
import { resetDatabase } from "../lib/storage/db";
import { taskRepository } from "../lib/storage/taskRepository";
import { DEFAULT_PREFERENCES } from "../lib/constants";
import { createProject } from "../types/project";
import { createTask } from "../types/task";

describe("storage repositories", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test("stores and loads projects and tasks", async () => {
    const project = createProject({ name: "Project A" }, "2026-04-23T00:00:00.000Z");
    const task = createTask(
      { projectId: project.id, title: "Task A" },
      "2026-04-23T00:10:00.000Z",
    );

    await projectRepository.save(project);
    await taskRepository.save(task);

    expect((await projectRepository.list())[0]?.name).toBe("Project A");
    expect((await taskRepository.listByProject(project.id))[0]?.title).toBe("Task A");
  });

  test("stores focus references instead of task copies", async () => {
    await focusRepository.add({
      addedAt: "2026-04-23T00:00:00.000Z",
      taskId: "task-1",
    });

    expect(await focusRepository.list()).toEqual([
      {
        addedAt: "2026-04-23T00:00:00.000Z",
        taskId: "task-1",
      },
    ]);
  });

  test("saves editable reports and preferences", async () => {
    const report = {
      createdAt: "2026-04-23T00:00:00.000Z",
      draft: {
        blockers: [],
        completedItems: ["完成任务 A"],
        keyChanges: ["修改接口"],
        nextSteps: ["推进任务 B"],
        overview: "本期完成 1 项任务。",
      },
      id: "report-1",
      polishedContent: "本周完成任务 A，并修改接口。",
      rangeEnd: "2026-04-23T23:59:59.000Z",
      rangeStart: "2026-04-23T00:00:00.000Z",
      sourceTaskIds: ["task-1"],
      title: "日报 2026-04-23",
      type: "daily" as const,
      updatedAt: "2026-04-23T00:00:00.000Z",
    };

    await reportRepository.save(report);
    await preferenceRepository.save({
      ...DEFAULT_PREFERENCES,
      theme: "dark",
      updatedAt: "2026-04-23T00:00:00.000Z",
    });

    expect((await reportRepository.list())[0]?.title).toBe("日报 2026-04-23");
    expect((await preferenceRepository.load()).theme).toBe("dark");
  });
});
