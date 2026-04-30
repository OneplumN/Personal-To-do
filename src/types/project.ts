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
  doneCount: number;
  latestActivityAt: string;
  inProgressCount: number;
  latestCompletedTaskTitle: string | null;
  progress: number;
  totalTasks: number;
  todoCount: number;
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
  const todoCount = projectTasks.filter((task) => task.status === "todo").length;
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

  const latestActivityAt = projectTasks.reduce(
    (latest, task) => {
      const taskTimestamp = task.completionWrapUp?.completedAt ?? task.updatedAt;
      return taskTimestamp.localeCompare(latest) > 0 ? taskTimestamp : latest;
    },
    project.updatedAt,
  );

  return {
    blockedCount,
    doneCount: completedTasks.length,
    latestActivityAt,
    inProgressCount,
    latestCompletedTaskTitle: completedTasks[0]?.title ?? null,
    progress: project.manualProgressOverride ?? autoProgress,
    totalTasks,
    todoCount,
  };
}
