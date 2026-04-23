import { create } from "zustand";
import { taskRepository } from "../../lib/storage/taskRepository";
import {
  appendTaskLog,
  completeTask,
  createChecklistItem,
  createTask,
  type Task,
  type TaskCreateInput,
  type TaskStatus,
} from "../../types/task";

type CompletionInput = {
  keyChanges: string;
  notes: string;
  summary: string;
};

type TaskState = {
  addChecklistItem: (taskId: string, text: string) => Promise<Task | null>;
  appendProgressLog: (taskId: string, content: string) => Promise<Task | null>;
  completeTask: (taskId: string, input: CompletionInput) => Promise<Task | null>;
  createTask: (input: TaskCreateInput) => Promise<Task>;
  isLoaded: boolean;
  loadTasks: () => Promise<Task[]>;
  removeTask: (taskId: string) => Promise<void>;
  setStatus: (taskId: string, status: TaskStatus) => Promise<Task | null>;
  tasks: Task[];
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<Task | null>;
  updateTask: (
    taskId: string,
    update: Partial<Pick<Task, "body" | "title">>,
  ) => Promise<Task | null>;
};

function replaceTask(tasks: Task[], nextTask: Task) {
  return tasks.map((task) => (task.id === nextTask.id ? nextTask : task));
}

export const useTaskStore = create<TaskState>((set, get) => ({
  async addChecklistItem(taskId, text) {
    const task = get().tasks.find((item) => item.id === taskId);
    const trimmed = text.trim();

    if (!task || !trimmed) {
      return null;
    }

    const nextTask: Task = {
      ...task,
      checklist: [...task.checklist, createChecklistItem(trimmed)],
      updatedAt: new Date().toISOString(),
    };
    await taskRepository.save(nextTask);
    set({ tasks: replaceTask(get().tasks, nextTask) });
    return nextTask;
  },
  async appendProgressLog(taskId, content) {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      return null;
    }
    const nextTask = appendTaskLog(task, content);
    await taskRepository.save(nextTask);
    set({ tasks: replaceTask(get().tasks, nextTask) });
    return nextTask;
  },
  async completeTask(taskId, input) {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      return null;
    }
    const nextTask = completeTask(task, input);
    await taskRepository.save(nextTask);
    set({ tasks: replaceTask(get().tasks, nextTask) });
    return nextTask;
  },
  async createTask(input) {
    const task = createTask(input);
    await taskRepository.save(task);
    set({ tasks: [task, ...get().tasks] });
    return task;
  },
  isLoaded: false,
  async loadTasks() {
    const tasks = await taskRepository.listAll();
    set({ isLoaded: true, tasks });
    return tasks;
  },
  async removeTask(taskId) {
    await taskRepository.delete(taskId);
    set({ tasks: get().tasks.filter((task) => task.id !== taskId) });
  },
  async setStatus(taskId, status) {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      return null;
    }
    const nextTask: Task = {
      ...task,
      completionWrapUp: status === "done" ? task.completionWrapUp : null,
      status,
      updatedAt: new Date().toISOString(),
    };
    await taskRepository.save(nextTask);
    set({ tasks: replaceTask(get().tasks, nextTask) });
    return nextTask;
  },
  tasks: [],
  async toggleChecklistItem(taskId, itemId) {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      return null;
    }
    const nextTask: Task = {
      ...task,
      checklist: task.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item,
      ),
      updatedAt: new Date().toISOString(),
    };
    await taskRepository.save(nextTask);
    set({ tasks: replaceTask(get().tasks, nextTask) });
    return nextTask;
  },
  async updateTask(taskId, update) {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      return null;
    }
    const nextTask: Task = {
      ...task,
      body: update.body === undefined ? task.body : update.body.trim(),
      title: update.title === undefined ? task.title : update.title.trim(),
      updatedAt: new Date().toISOString(),
    };
    await taskRepository.save(nextTask);
    set({ tasks: replaceTask(get().tasks, nextTask) });
    return nextTask;
  },
}));
