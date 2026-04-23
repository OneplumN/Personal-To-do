import type { Preferences } from "../types/preferences";
import type { ReportType } from "../types/report";
import type { TaskStatus } from "../types/task";

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  blocked: "阻塞",
  done: "已完成",
  in_progress: "进行中",
  todo: "待做",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  daily: "日报",
  monthly: "月报",
  weekly: "周报",
};

export const DEFAULT_PREFERENCES: Preferences = {
  aiEndpoint: "",
  aiKey: "",
  aiRole: "",
  id: "preferences",
  laneColors: {
    doing: "#5AC8FA",
    done: "#34D399",
    task: "#FFB347",
  },
  theme: "light",
  updatedAt: new Date(0).toISOString(),
};

export const APP_DB_NAME = "personal-to-do-db";
export const APP_DB_VERSION = 1;
