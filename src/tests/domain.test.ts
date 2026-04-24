import { describe, expect, test } from "vitest";
import {
  DEFAULT_PREFERENCES,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_ORDER,
} from "../lib/constants";
import { createProject, buildProjectSummary } from "../types/project";
import { createEmptyDraft } from "../types/report";
import {
  completeTask,
  createChecklistItem,
  createTask,
  getChecklistProgress,
  moveChecklistItem,
  removeChecklistItem,
  updateChecklistItemText,
} from "../types/task";

describe("domain definitions", () => {
  test("exposes the approved task status order", () => {
    expect(TASK_STATUS_ORDER).toEqual(["todo", "in_progress", "blocked", "done"]);
    expect(TASK_PRIORITY_ORDER).toEqual(["normal", "important", "urgent"]);
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

  test("supports checklist edit, delete, reorder, and notes field", () => {
    let task = createTask({
      projectId: "project-1",
      title: "Task for checklist editing",
    });

    const itemA = createChecklistItem("A");
    const itemB = createChecklistItem("B");

    task = {
      ...task,
      checklist: [itemA, itemB],
      notes: "补充备注",
    };

    task = updateChecklistItemText(task, itemA.id, "A-updated");
    expect(task.checklist[0]?.text).toBe("A-updated");

    task = moveChecklistItem(task, itemB.id, "up");
    expect(task.checklist[0]?.id).toBe(itemB.id);

    task = removeChecklistItem(task, itemB.id);
    expect(task.checklist).toHaveLength(1);
    expect(task.notes).toBe("补充备注");
  });
});
