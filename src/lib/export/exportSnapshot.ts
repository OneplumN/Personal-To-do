import { focusRepository } from "../storage/focusRepository";
import { preferenceRepository } from "../storage/preferenceRepository";
import { projectRepository } from "../storage/projectRepository";
import { reportRepository } from "../storage/reportRepository";
import { taskRepository } from "../storage/taskRepository";
import type { FocusReference } from "../../types/focus";
import type { Preferences } from "../../types/preferences";
import type { Project } from "../../types/project";
import type { SavedReport } from "../../types/report";
import type { Task } from "../../types/task";

export type AppSnapshot = {
  exportedAt: string;
  focusRefs: FocusReference[];
  preferences: Preferences;
  projects: Project[];
  reports: SavedReport[];
  tasks: Task[];
  version: 1;
};

export async function exportSnapshot(): Promise<AppSnapshot> {
  const [projects, tasks, focusRefs, reports, preferences] = await Promise.all([
    projectRepository.list(),
    taskRepository.listAll(),
    focusRepository.list(),
    reportRepository.list(),
    preferenceRepository.load(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    focusRefs,
    preferences,
    projects,
    reports,
    tasks,
    version: 1,
  };
}
