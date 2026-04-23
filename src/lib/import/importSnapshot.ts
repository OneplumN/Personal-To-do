import { resetDatabase } from "../storage/db";
import { focusRepository } from "../storage/focusRepository";
import { preferenceRepository } from "../storage/preferenceRepository";
import { projectRepository } from "../storage/projectRepository";
import { reportRepository } from "../storage/reportRepository";
import { taskRepository } from "../storage/taskRepository";
import type { AppSnapshot } from "../export/exportSnapshot";

export function validateSnapshot(snapshot: unknown): snapshot is AppSnapshot {
  if (!snapshot || typeof snapshot !== "object") {
    return false;
  }

  const candidate = snapshot as Partial<AppSnapshot>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.focusRefs) &&
    Array.isArray(candidate.reports) &&
    Boolean(candidate.preferences)
  );
}

export async function importSnapshot(snapshot: unknown) {
  if (!validateSnapshot(snapshot)) {
    throw new Error("导入文件格式无效。");
  }

  await resetDatabase();

  await Promise.all(snapshot.projects.map((project) => projectRepository.save(project)));
  await Promise.all(snapshot.tasks.map((task) => taskRepository.save(task)));
  await Promise.all(snapshot.focusRefs.map((ref) => focusRepository.add(ref)));
  await Promise.all(snapshot.reports.map((report) => reportRepository.save(report)));
  await preferenceRepository.save(snapshot.preferences);

  return snapshot;
}
