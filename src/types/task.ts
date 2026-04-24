export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "normal" | "important" | "urgent";

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
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
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
    notes: "",
    status: "todo",
    priority: "normal",
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

export function updateChecklistItemText(
  task: Task,
  itemId: string,
  text: string,
  now = new Date().toISOString(),
): Task {
  return {
    ...task,
    checklist: task.checklist.map((item) =>
      item.id === itemId ? { ...item, text: text.trim() } : item,
    ),
    updatedAt: now,
  };
}

export function removeChecklistItem(
  task: Task,
  itemId: string,
  now = new Date().toISOString(),
): Task {
  return {
    ...task,
    checklist: task.checklist.filter((item) => item.id !== itemId),
    updatedAt: now,
  };
}

export function moveChecklistItem(
  task: Task,
  itemId: string,
  direction: "up" | "down",
  now = new Date().toISOString(),
): Task {
  const index = task.checklist.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return task;
  }

  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= task.checklist.length) {
    return task;
  }

  const checklist = [...task.checklist];
  const [item] = checklist.splice(index, 1);
  checklist.splice(nextIndex, 0, item);

  return {
    ...task,
    checklist,
    updatedAt: now,
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
