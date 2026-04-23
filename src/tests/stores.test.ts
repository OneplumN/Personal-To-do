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

    expect(useFocusStore.getState().focusRefs[0]?.taskId).toBe(task.id);
    expect(useTaskStore.getState().tasks[0]?.progressLog[0]?.content).toBe(
      "补充了范围说明",
    );
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
