import { beforeEach, describe, expect, test } from "vitest";
import { resetDatabase } from "../lib/storage/db";
import { useFocusStore } from "../features/focus/focusStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { createEmptyDraft } from "../types/report";

describe("zustand stores", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
  });

  test("creates projects and tasks, then updates a task through focus references", async () => {
    const project = await useProjectStore.getState().createProject({
      name: "Project Alpha",
    });
    const task = await useTaskStore.getState().createTask({
      projectId: project.id,
      title: "Prepare scope",
    });

    await useFocusStore.getState().addTask(task.id);
    await useTaskStore.getState().appendProgressLog(task.id, "补充了范围说明");
    await useTaskStore.getState().setPriority(task.id, "important");

    expect(useFocusStore.getState().focusRefs[0]?.taskId).toBe(task.id);
    expect(useTaskStore.getState().tasks[0]?.progressLog[0]?.content).toBe(
      "补充了范围说明",
    );
    expect(useTaskStore.getState().tasks[0]?.priority).toBe("important");
  });

  test("reorders focus references and persists the normalized order", async () => {
    const project = await useProjectStore.getState().createProject({
      name: "Project Focus",
    });
    const firstTask = await useTaskStore.getState().createTask({
      projectId: project.id,
      title: "First focus",
    });
    const secondTask = await useTaskStore.getState().createTask({
      projectId: project.id,
      title: "Second focus",
    });

    await useFocusStore.getState().addTask(firstTask.id);
    await useFocusStore.getState().addTask(secondTask.id);
    await useFocusStore.getState().reorderTask(secondTask.id, 0);

    expect(useFocusStore.getState().focusRefs.map((ref) => ref.taskId)).toEqual([
      secondTask.id,
      firstTask.id,
    ]);
    expect(useFocusStore.getState().focusRefs.map((ref) => ref.order)).toEqual([0, 1]);
  });

  test("supports checklist item editing, deletion, reordering, and task notes", async () => {
    const project = await useProjectStore.getState().createProject({
      name: "Project Checklist",
    });
    const task = await useTaskStore.getState().createTask({
      projectId: project.id,
      title: "Prepare checklist",
    });

    await useTaskStore.getState().addChecklistItem(task.id, "First");
    await useTaskStore.getState().addChecklistItem(task.id, "Second");

    const createdTask = useTaskStore.getState().tasks[0];
    const firstId = createdTask.checklist[0]?.id;
    const secondId = createdTask.checklist[1]?.id;

    await useTaskStore.getState().updateChecklistItemText(task.id, firstId, "First updated");
    await useTaskStore.getState().moveChecklistItem(task.id, secondId, "up");
    await useTaskStore.getState().removeChecklistItem(task.id, firstId);
    await useTaskStore.getState().updateTask(task.id, { notes: "备注内容" });

    const nextTask = useTaskStore.getState().tasks[0];
    expect(nextTask.checklist).toHaveLength(1);
    expect(nextTask.checklist[0]?.text).toBe("Second");
    expect(nextTask.notes).toBe("备注内容");
  });

  test("saves and updates editable reports", async () => {
    const report = {
      createdAt: "2026-04-23T00:00:00.000Z",
      draft: createEmptyDraft(),
      id: "report-1",
      polishedContent: "",
      rangeEnd: "2026-04-23T23:59:59.000Z",
      rangeStart: "2026-04-23T00:00:00.000Z",
      sourceTaskIds: [],
      title: "日报",
      type: "daily" as const,
      updatedAt: "2026-04-23T00:00:00.000Z",
    };

    await useReportStore.getState().saveReport(report);
    await useReportStore.getState().updateReport("report-1", {
      polishedContent: "整理后的日报正文",
    });

    expect(useReportStore.getState().reports[0]?.polishedContent).toBe(
      "整理后的日报正文",
    );
  });
});
