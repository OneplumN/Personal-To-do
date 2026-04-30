import type {
  AiProfile,
  AiProviderPreset,
  AiRoleTemplate,
  Preferences,
} from "../types/preferences";
import type { ReportType } from "../types/report";
import type { TaskPriority, TaskStatus } from "../types/task";

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

export const TASK_PRIORITY_ORDER: TaskPriority[] = [
  "normal",
  "important",
  "urgent",
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  important: "重要",
  normal: "普通",
  urgent: "紧急",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  custom: "报告",
  daily: "日报",
  monthly: "月报",
  weekly: "周报",
};

export const DEFAULT_AI_PROFILE_ID = "ai-profile-default";

export const AI_PROVIDER_PRESETS: Record<
  AiProviderPreset,
  { endpoint: string; label: string }
> = {
  bigmodel: {
    endpoint: "https://open.bigmodel.cn/api/paas/v4",
    label: "智谱",
  },
  custom: {
    endpoint: "",
    label: "Custom",
  },
  deepseek: {
    endpoint: "https://api.deepseek.com",
    label: "DeepSeek",
  },
  kimi: {
    endpoint: "https://api.moonshot.cn/v1",
    label: "Kimi",
  },
};

export const DEFAULT_AI_ROLE_TEMPLATES: AiRoleTemplate[] = [];

export const DEFAULT_AI_PROFILES: AiProfile[] = [
  {
    apiKey: "",
    endpoint: "",
    extraBodyJson: "",
    id: DEFAULT_AI_PROFILE_ID,
    model: "",
    models: [],
    name: "API 1",
    preset: "custom",
  },
];

export const DEFAULT_PREFERENCES: Preferences = {
  activeAiProfileId: DEFAULT_AI_PROFILE_ID,
  activeAiRoleTemplateId: "",
  aiEndpoint: "",
  aiKey: "",
  aiProfiles: DEFAULT_AI_PROFILES,
  aiRole: "",
  aiRolePresets: [],
  aiRoleTemplates: DEFAULT_AI_ROLE_TEMPLATES,
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
