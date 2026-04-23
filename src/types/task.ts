export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type TaskLogEntry = {
  id: string;
  content: string;
  createdAt: string;
};

export type TaskCompletionWrapUp = {
  summary: string;
  keyChanges: string;
  notes: string;
  completedAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  body: string;
  status: TaskStatus;
  checklist: ChecklistItem[];
  progressLog: TaskLogEntry[];
  completionWrapUp: TaskCompletionWrapUp | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskCreateInput = {
  body?: string;
  projectId: string;
  title: string;
};

export function createTask(input: TaskCreateInput, now = new Date().toISOString()): Task {
  return {
    id: crypto.randomUUID(),
    projectId: input.projectId,
    title: input.title.trim(),
    body: input.body?.trim() ?? "",
    status: "todo",
    checklist: [],
    progressLog: [],
    completionWrapUp: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createChecklistItem(text: string): ChecklistItem {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    done: false,
  };
}

export function getChecklistProgress(task: Task) {
  const total = task.checklist.length;
  const completed = task.checklist.filter((item) => item.done).length;

  return {
    completed,
    total,
  };
}

export function isTaskDone(task: Task) {
  return task.status === "done";
}

export function appendTaskLog(task: Task, content: string, now = new Date().toISOString()): Task {
  const trimmed = content.trim();

  if (!trimmed) {
    return task;
  }

  return {
    ...task,
    progressLog: [
      {
        id: crypto.randomUUID(),
        content: trimmed,
        createdAt: now,
      },
      ...task.progressLog,
    ],
    updatedAt: now,
  };
}

export function completeTask(
  task: Task,
  input: Omit<TaskCompletionWrapUp, "completedAt">,
  now = new Date().toISOString(),
): Task {
  return {
    ...task,
    status: "done",
    completionWrapUp: {
      completedAt: now,
      keyChanges: input.keyChanges.trim(),
      notes: input.notes.trim(),
      summary: input.summary.trim(),
    },
    updatedAt: now,
  };
}
