export type ReportType = "custom" | "daily" | "weekly" | "monthly";

export type ReportDraft = {
  blockers: string[];
  completedItems: string[];
  keyChanges: string[];
  nextSteps: string[];
  overview: string;
};

export type SavedReport = {
  createdAt: string;
  draft: ReportDraft;
  id: string;
  polishedContent: string;
  rangeEnd: string;
  rangeStart: string;
  sourceTaskIds: string[];
  title: string;
  type: ReportType;
  updatedAt: string;
};

export function createEmptyDraft(): ReportDraft {
  return {
    blockers: [],
    completedItems: [],
    keyChanges: [],
    nextSteps: [],
    overview: "",
  };
}
