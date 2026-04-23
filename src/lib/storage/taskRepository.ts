import { getDatabase } from "./db";
import type { Task } from "../../types/task";

export const taskRepository = {
  async delete(taskId: string) {
    const db = await getDatabase();
    await db.delete("tasks", taskId);
  },

  async get(taskId: string) {
    const db = await getDatabase();
    return db.get("tasks", taskId);
  },

  async listAll() {
    const db = await getDatabase();
    const tasks = await db.getAll("tasks");
    return tasks.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },

  async listByIds(taskIds: string[]) {
    const db = await getDatabase();
    const records = await Promise.all(taskIds.map((taskId) => db.get("tasks", taskId)));
    return records.filter((task): task is Task => Boolean(task));
  },

  async listByProject(projectId: string) {
    const db = await getDatabase();
    const tasks = await db.getAllFromIndex("tasks", "by-projectId", projectId);
    return tasks.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },

  async listCompletedBetween(rangeStart: string, rangeEnd: string) {
    const tasks = await this.listAll();
    return tasks.filter((task) => {
      if (task.status !== "done" || !task.completionWrapUp?.completedAt) {
        return false;
      }

      return (
        task.completionWrapUp.completedAt >= rangeStart &&
        task.completionWrapUp.completedAt <= rangeEnd
      );
    });
  },

  async save(task: Task) {
    const db = await getDatabase();
    await db.put("tasks", task);
    return task;
  },
};
