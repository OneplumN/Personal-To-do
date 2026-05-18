export type ThemeMode = "light" | "dark";

export type LaneColors = {
  task: string;
  doing: string;
  done: string;
};

export type TodayStepHandlePosition = {
  edge: "left" | "right";
  monitorName?: string;
  monitorX?: number;
  monitorY?: number;
  yRatio: number;
};

export type AiRolePreset = {
  id: string;
  label: string;
  prompt: string;
};

export type AiProviderPreset =
  | "bigmodel"
  | "custom"
  | "deepseek"
  | "kimi"
  | "minimax"
  | "qwen";

export type AiProfile = {
  id: string;
  name: string;
  preset: AiProviderPreset;
  endpoint: string;
  modelsEndpoint: string;
  model: string;
  models: string[];
  apiKey: string;
  extraBodyJson: string;
};

export type AiRoleTemplate = {
  builtIn: boolean;
  id: string;
  name: string;
  prompt: string;
};

export type Preferences = {
  id: "preferences";
  theme: ThemeMode;
  laneColors: LaneColors;
  aiEndpoint: string;
  aiKey: string;
  aiRole: string;
  aiRolePresets: AiRolePreset[];
  activeAiProfileId: string;
  activeAiRoleTemplateId: string;
  aiProfiles: AiProfile[];
  aiRoleTemplates: AiRoleTemplate[];
  todayStepDocked: boolean;
  todayStepHandlePosition: TodayStepHandlePosition;
  todayStepPinned: boolean;
  todayStepShortcut: string;
  updatedAt: string;
};
