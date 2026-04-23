import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { FocusReference } from "../../types/focus";
import type { Preferences } from "../../types/preferences";
import type { Project } from "../../types/project";
import type { SavedReport } from "../../types/report";
import type { Task } from "../../types/task";
import { APP_DB_NAME, APP_DB_VERSION } from "../constants";

type AppSchema = DBSchema & {
  focusRefs: {
    key: string;
    value: FocusReference;
  };
  preferences: {
    key: string;
    value: Preferences;
  };
  projects: {
    indexes: {
      "by-updatedAt": string;
    };
    key: string;
    value: Project;
  };
  reports: {
    indexes: {
      "by-createdAt": string;
      "by-type": string;
    };
    key: string;
    value: SavedReport;
  };
  tasks: {
    indexes: {
      "by-projectId": string;
      "by-status": string;
      "by-updatedAt": string;
    };
    key: string;
    value: Task;
  };
};

let dbPromise: Promise<IDBPDatabase<AppSchema>> | null = null;
let activeDb: IDBPDatabase<AppSchema> | null = null;

export function getDatabase() {
  if (!dbPromise) {
    dbPromise = openDB<AppSchema>(APP_DB_NAME, APP_DB_VERSION, {
      upgrade(database) {
        const projectStore = database.createObjectStore("projects", {
          keyPath: "id",
        });
        projectStore.createIndex("by-updatedAt", "updatedAt");

        const taskStore = database.createObjectStore("tasks", {
          keyPath: "id",
        });
        taskStore.createIndex("by-projectId", "projectId");
        taskStore.createIndex("by-status", "status");
        taskStore.createIndex("by-updatedAt", "updatedAt");

        const focusStore = database.createObjectStore("focusRefs", {
          keyPath: "taskId",
        });
        focusStore.transaction.oncomplete = null;

        database.createObjectStore("preferences", {
          keyPath: "id",
        });

        const reportStore = database.createObjectStore("reports", {
          keyPath: "id",
        });
        reportStore.createIndex("by-createdAt", "createdAt");
        reportStore.createIndex("by-type", "type");
      },
    }).then((database) => {
      activeDb = database;
      return database;
    });
  }

  return dbPromise;
}

export async function resetDatabase() {
  if (activeDb) {
    activeDb.close();
    activeDb = null;
  }
  dbPromise = null;
  await deleteDB(APP_DB_NAME);
}
