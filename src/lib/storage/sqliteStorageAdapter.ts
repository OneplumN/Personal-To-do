import Database from "@tauri-apps/plugin-sql";
import { DEFAULT_PREFERENCES } from "../constants";
import {
  sortByCreatedAtDesc,
  sortByUpdatedAtDesc,
  sortFocusRefs,
  type StorageAdapter,
} from "./storageAdapter";
import { sortProjects } from "../../types/project";
import type { FocusReference } from "../../types/focus";
import type { Preferences } from "../../types/preferences";
import type { Project } from "../../types/project";
import type { SavedReport } from "../../types/report";
import type { Task } from "../../types/task";

const SQLITE_URL = "sqlite:yibu.db";

type JsonRow = {
  payload_json: string;
};

let databasePromise: Promise<Database> | null = null;

function getSqliteDatabase() {
  databasePromise ??= Database.load(SQLITE_URL);
  return databasePromise;
}

function serializePayload(payload: unknown) {
  return JSON.stringify(payload);
}

function parsePayload<T>(row: JsonRow) {
  return JSON.parse(row.payload_json) as T;
}

async function selectPayloads<T>(sql: string, bindValues: unknown[] = []) {
  const db = await getSqliteDatabase();
  const rows = await db.select<JsonRow[]>(sql, bindValues);
  return rows.map((row) => parsePayload<T>(row));
}

async function selectPayload<T>(sql: string, bindValues: unknown[] = []) {
  const rows = await selectPayloads<T>(sql, bindValues);
  return rows[0];
}

function getCompletedAt(task: Task) {
  return task.completionWrapUp?.completedAt ?? null;
}

function buildInsertStatement(tableName: string, columnNames: string[], rowCount: number) {
  const rowPlaceholders = Array.from({ length: rowCount }, (_, rowIndex) => {
    const placeholders = columnNames.map((_, columnIndex) => {
      return `$${rowIndex * columnNames.length + columnIndex + 1}`;
    });
    return `(${placeholders.join(", ")})`;
  });

  return `INSERT OR REPLACE INTO ${tableName} (${columnNames.join(", ")}) VALUES ${rowPlaceholders.join(", ")}`;
}

async function insertRows(
  tableName: string,
  columnNames: string[],
  rows: unknown[][],
) {
  if (rows.length === 0) {
    return;
  }

  const db = await getSqliteDatabase();
  const chunkSize = Math.max(1, Math.floor(900 / columnNames.length));

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await db.execute(
      buildInsertStatement(tableName, columnNames, chunk.length),
      chunk.flat(),
    );
  }
}

async function insertFocusRefs(references: FocusReference[]) {
  await insertRows(
    "focus_refs",
    ["task_id", "added_at", "order_value", "payload_json"],
    references.map((reference) => [
      reference.taskId,
      reference.addedAt,
      reference.order ?? null,
      serializePayload(reference),
    ]),
  );
}

async function clearAll() {
  const db = await getSqliteDatabase();
  await db.execute("DELETE FROM focus_refs");
  await db.execute("DELETE FROM reports");
  await db.execute("DELETE FROM tasks");
  await db.execute("DELETE FROM projects");
  await db.execute("DELETE FROM preferences");
}

async function ensureReady() {
  await getSqliteDatabase();
}

export const sqliteStorageAdapter: StorageAdapter = {
  focusRefs: {
    async add(reference) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute(
        "INSERT OR REPLACE INTO focus_refs (task_id, added_at, order_value, payload_json) VALUES ($1, $2, $3, $4)",
        [reference.taskId, reference.addedAt, reference.order ?? null, serializePayload(reference)],
      );
      return reference;
    },
    async clear() {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute("DELETE FROM focus_refs");
    },
    async list() {
      await ensureReady();
      return sortFocusRefs(
        await selectPayloads<FocusReference>(
          "SELECT payload_json FROM focus_refs ORDER BY COALESCE(order_value, 2147483647), added_at ASC",
        ),
      );
    },
    async remove(taskId) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute("DELETE FROM focus_refs WHERE task_id = $1", [taskId]);
    },
    async replaceAll(references) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute("DELETE FROM focus_refs");
      await insertFocusRefs(references);
      return references;
    },
  },
  preferences: {
    async load() {
      await ensureReady();
      return selectPayload<Preferences>("SELECT payload_json FROM preferences WHERE id = $1", [
        DEFAULT_PREFERENCES.id,
      ]);
    },
    async save(preferences) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute(
        "INSERT OR REPLACE INTO preferences (id, updated_at, payload_json) VALUES ($1, $2, $3)",
        [preferences.id, preferences.updatedAt, serializePayload(preferences)],
      );
      return preferences;
    },
  },
  projects: {
    async delete(projectId) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute("DELETE FROM projects WHERE id = $1", [projectId]);
    },
    async get(projectId) {
      await ensureReady();
      return selectPayload<Project>("SELECT payload_json FROM projects WHERE id = $1", [projectId]);
    },
    async list() {
      await ensureReady();
      return sortProjects(
        await selectPayloads<Project>("SELECT payload_json FROM projects ORDER BY updated_at DESC"),
      );
    },
    async save(project) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute(
        "INSERT OR REPLACE INTO projects (id, updated_at, payload_json) VALUES ($1, $2, $3)",
        [project.id, project.updatedAt, serializePayload(project)],
      );
      return project;
    },
  },
  reports: {
    async delete(reportId) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute("DELETE FROM reports WHERE id = $1", [reportId]);
    },
    async get(reportId) {
      await ensureReady();
      return selectPayload<SavedReport>("SELECT payload_json FROM reports WHERE id = $1", [
        reportId,
      ]);
    },
    async list() {
      await ensureReady();
      return sortByCreatedAtDesc(
        await selectPayloads<SavedReport>(
          "SELECT payload_json FROM reports ORDER BY created_at DESC",
        ),
      );
    },
    async save(report) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute(
        "INSERT OR REPLACE INTO reports (id, type, created_at, payload_json) VALUES ($1, $2, $3, $4)",
        [report.id, report.type, report.createdAt, serializePayload(report)],
      );
      return report;
    },
  },
  async reset() {
    await clearAll();
  },
  tasks: {
    async delete(taskId) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute("DELETE FROM tasks WHERE id = $1", [taskId]);
    },
    async get(taskId) {
      await ensureReady();
      return selectPayload<Task>("SELECT payload_json FROM tasks WHERE id = $1", [taskId]);
    },
    async listAll() {
      await ensureReady();
      return sortByUpdatedAtDesc(
        await selectPayloads<Task>("SELECT payload_json FROM tasks ORDER BY updated_at DESC"),
      );
    },
    async listByIds(taskIds) {
      await ensureReady();
      const records = await Promise.all(taskIds.map((taskId) => this.get(taskId)));
      return records.filter((task): task is Task => Boolean(task));
    },
    async listByProject(projectId) {
      await ensureReady();
      return sortByUpdatedAtDesc(
        await selectPayloads<Task>(
          "SELECT payload_json FROM tasks WHERE project_id = $1 ORDER BY updated_at DESC",
          [projectId],
        ),
      );
    },
    async save(task) {
      await ensureReady();
      const db = await getSqliteDatabase();
      await db.execute(
        "INSERT OR REPLACE INTO tasks (id, project_id, status, updated_at, completed_at, payload_json) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          task.id,
          task.projectId,
          task.status,
          task.updatedAt,
          getCompletedAt(task),
          serializePayload(task),
        ],
      );
      return task;
    },
  },
};
