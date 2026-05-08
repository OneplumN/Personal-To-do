import { getDatabase, resetDatabase } from "./db";
import {
  sortByCreatedAtDesc,
  sortByUpdatedAtDesc,
  sortFocusRefs,
  type StorageAdapter,
} from "./storageAdapter";
import { sortProjects } from "../../types/project";
import type { Task } from "../../types/task";

export const indexedDbStorageAdapter: StorageAdapter = {
  focusRefs: {
    async add(reference) {
      const db = await getDatabase();
      await db.put("focusRefs", reference);
      return reference;
    },
    async clear() {
      const db = await getDatabase();
      await db.clear("focusRefs");
    },
    async list() {
      const db = await getDatabase();
      return sortFocusRefs(await db.getAll("focusRefs"));
    },
    async remove(taskId) {
      const db = await getDatabase();
      await db.delete("focusRefs", taskId);
    },
    async replaceAll(references) {
      const db = await getDatabase();
      const transaction = db.transaction("focusRefs", "readwrite");
      await transaction.store.clear();
      for (const reference of references) {
        await transaction.store.put(reference);
      }
      await transaction.done;
      return references;
    },
  },
  preferences: {
    async load() {
      const db = await getDatabase();
      return db.get("preferences", "preferences");
    },
    async save(preferences) {
      const db = await getDatabase();
      await db.put("preferences", preferences);
      return preferences;
    },
  },
  projects: {
    async delete(projectId) {
      const db = await getDatabase();
      await db.delete("projects", projectId);
    },
    async get(projectId) {
      const db = await getDatabase();
      return db.get("projects", projectId);
    },
    async list() {
      const db = await getDatabase();
      return sortProjects(await db.getAll("projects"));
    },
    async save(project) {
      const db = await getDatabase();
      await db.put("projects", project);
      return project;
    },
  },
  reports: {
    async delete(reportId) {
      const db = await getDatabase();
      await db.delete("reports", reportId);
    },
    async get(reportId) {
      const db = await getDatabase();
      return db.get("reports", reportId);
    },
    async list() {
      const db = await getDatabase();
      return sortByCreatedAtDesc(await db.getAll("reports"));
    },
    async save(report) {
      const db = await getDatabase();
      await db.put("reports", report);
      return report;
    },
  },
  reset: resetDatabase,
  tasks: {
    async delete(taskId) {
      const db = await getDatabase();
      await db.delete("tasks", taskId);
    },
    async get(taskId) {
      const db = await getDatabase();
      return db.get("tasks", taskId);
    },
    async listAll() {
      const db = await getDatabase();
      return sortByUpdatedAtDesc(await db.getAll("tasks"));
    },
    async listByIds(taskIds) {
      const db = await getDatabase();
      const records = await Promise.all(taskIds.map((taskId) => db.get("tasks", taskId)));
      return records.filter((task): task is Task => Boolean(task));
    },
    async listByProject(projectId) {
      const db = await getDatabase();
      return sortByUpdatedAtDesc(await db.getAllFromIndex("tasks", "by-projectId", projectId));
    },
    async save(task) {
      const db = await getDatabase();
      await db.put("tasks", task);
      return task;
    },
  },
};
