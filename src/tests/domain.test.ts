import { describe, expect, test } from "vitest";
import { DEFAULT_PREFERENCES, TASK_STATUS_ORDER } from "../lib/constants";
import { createProject, buildProjectSummary } from "../types/project";
import { createEmptyDraft } from "../types/report";
import { completeTask, createTask, getChecklistProgress } from "../types/task";

describe("domain definitions", () => {
  test("exposes the approved task status order", () => {
    expect(TASK_STATUS_ORDER).toEqual(["todo", "in_progress", "blocked", "done"]);
  });

  test("creates default preferences with lane colors", () => {
    expect(DEFAULT_PREFERENCES.id).toBe("preferences");
    expect(DEFAULT_PREFERENCES.laneColors.task).toBe("#FFB347");
  });

  test("builds a project summary from its tasks", () => {
    const project = createProject({ name: "Project A" }, "2026-04-23T00:00:00.000Z");
    const taskOne = createTask(
      { projectId: project.id, title: "Define scope" },
      "2026-04-23T00:00:00.000Z",
    );
    const taskTwo = completeTask(
      createTask(
        { projectId: project.id, title: "Ship feature" },
        "2026-04-23T01:00:00.000Z",
      ),
      {
        keyChanges: "Updated UI",
        notes: "QA passed",
        summary: "Feature shipped",
      },
      "2026-04-23T02:00:00.000Z",
    );

    const summary = buildProjectSummary(project, [
      { ...taskOne, status: "in_progress" },
      taskTwo,
    ]);

    expect(summary.inProgressCount).toBe(1);
    expect(summary.latestCompletedTaskTitle).toBe("Ship feature");
    expect(summary.progress).toBe(50);
    expect(summary.totalTasks).toBe(2);
  });

  test("tracks checklist progress and report draft shape", () => {
    const task = createTask({
      projectId: "project-1",
      title: "Task with checklist",
    });

    expect(getChecklistProgress(task)).toEqual({ completed: 0, total: 0 });
    expect(createEmptyDraft()).toEqual({
      blockers: [],
      completedItems: [],
      keyChanges: [],
      nextSteps: [],
      overview: "",
    });
  });
});
