import type { Task } from "./task";

export type Project = {
  id: string;
  name: string;
  description: string;
  manualProgressNote: string;
  manualProgressOverride: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectCreateInput = {
  description?: string;
  name: string;
};

export type ProjectSummary = {
  blockedCount: number;
  inProgressCount: number;
  latestCompletedTaskTitle: string | null;
  progress: number;
  totalTasks: number;
};

export function createProject(
  input: ProjectCreateInput,
  now = new Date().toISOString(),
): Project {
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    manualProgressNote: "",
    manualProgressOverride: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildProjectSummary(project: Project, tasks: Task[]): ProjectSummary {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const totalTasks = projectTasks.length;
  const inProgressCount = projectTasks.filter(
    (task) => task.status === "in_progress",
  ).length;
  const blockedCount = projectTasks.filter((task) => task.status === "blocked").length;
  const completedTasks = projectTasks
    .filter((task) => task.status === "done")
    .sort((left, right) => {
      const leftTime = left.completionWrapUp?.completedAt ?? left.updatedAt;
      const rightTime = right.completionWrapUp?.completedAt ?? right.updatedAt;
      return rightTime.localeCompare(leftTime);
    });

  const autoProgress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks.length / totalTasks) * 100,
        );

  return {
    blockedCount,
    inProgressCount,
    latestCompletedTaskTitle: completedTasks[0]?.title ?? null,
    progress: project.manualProgressOverride ?? autoProgress,
    totalTasks,
  };
}
