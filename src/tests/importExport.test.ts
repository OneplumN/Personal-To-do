import { beforeEach, describe, expect, test } from "vitest";
import { DEFAULT_PREFERENCES } from "../lib/constants";
import { exportSnapshot } from "../lib/export/exportSnapshot";
import { importSnapshot } from "../lib/import/importSnapshot";
import { resetDatabase } from "../lib/storage/db";
import { projectRepository } from "../lib/storage/projectRepository";
import { reportRepository } from "../lib/storage/reportRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { createProject } from "../types/project";
import { createEmptyDraft } from "../types/report";
import { createTask } from "../types/task";

describe("import and export snapshot", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test("exports the current snapshot shape", async () => {
    const project = createProject({ name: "Project Export" });
    const task = createTask({ projectId: project.id, title: "Task Export" });

    await projectRepository.save(project);
    await taskRepository.save(task);

    const snapshot = await exportSnapshot();

    expect(snapshot.version).toBe(1);
    expect(snapshot.projects[0]?.name).toBe("Project Export");
    expect(snapshot.tasks[0]?.title).toBe("Task Export");
  });

  test("replaces local data through import", async () => {
    const snapshot = {
      exportedAt: "2026-04-23T10:00:00.000Z",
      focusRefs: [],
      preferences: {
        ...DEFAULT_PREFERENCES,
        theme: "dark" as const,
        updatedAt: "2026-04-23T10:00:00.000Z",
      },
      projects: [
        {
          createdAt: "2026-04-23T10:00:00.000Z",
          description: "",
          id: "project-imported",
          manualProgressNote: "",
          manualProgressOverride: null,
          name: "Imported Project",
          updatedAt: "2026-04-23T10:00:00.000Z",
        },
      ],
      reports: [
        {
          createdAt: "2026-04-23T10:00:00.000Z",
          draft: createEmptyDraft(),
          id: "report-imported",
          polishedContent: "已导入报告",
          rangeEnd: "2026-04-23T23:59:59.000Z",
          rangeStart: "2026-04-23T00:00:00.000Z",
          sourceTaskIds: ["task-imported"],
          title: "导入日报",
          type: "daily" as const,
          updatedAt: "2026-04-23T10:00:00.000Z",
        },
      ],
      tasks: [
        {
          body: "",
          checklist: [],
          completionWrapUp: null,
          createdAt: "2026-04-23T10:00:00.000Z",
          id: "task-imported",
          progressLog: [],
          projectId: "project-imported",
          status: "todo" as const,
          title: "Imported Task",
          updatedAt: "2026-04-23T10:00:00.000Z",
        },
      ],
      version: 1 as const,
    };

    await importSnapshot(snapshot);

    expect((await projectRepository.list())[0]?.name).toBe("Imported Project");
    expect((await taskRepository.listAll())[0]?.title).toBe("Imported Task");
    expect((await reportRepository.list())[0]?.title).toBe("导入日报");
  });
});
