export type ThemeMode = "light" | "dark";

export type LaneColors = {
  task: string;
  doing: string;
  done: string;
};

export type Preferences = {
  id: "preferences";
  theme: ThemeMode;
  laneColors: LaneColors;
  aiEndpoint: string;
  aiKey: string;
  aiRole: string;
  updatedAt: string;
};
