import { buildReportDraft, getReportRange } from "../../lib/ai/buildReportDraft";
import { polishReport, type ReportGenerationOptions } from "../../lib/ai/polishReport";
import { REPORT_TYPE_LABELS } from "../../lib/constants";
import type { Project } from "../../types/project";
import type { SavedReport, ReportType } from "../../types/report";
import type { Task } from "../../types/task";

export function buildReportTitle(
  type: ReportType,
  now = new Date(),
  scopeLabel?: string,
) {
  const periodLabel =
    type === "custom"
      ? now.toLocaleDateString("zh-CN")
      : type === "daily"
      ? now.toLocaleDateString("zh-CN")
      : type === "weekly"
        ? `${now.getFullYear()}-W${Math.ceil(
            (now.getDate() + (new Date(now.getFullYear(), now.getMonth(), 1).getDay() || 7) - 1) /
              7,
          )}`
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return scopeLabel
    ? `${REPORT_TYPE_LABELS[type]} · ${scopeLabel} · ${periodLabel}`
    : `${REPORT_TYPE_LABELS[type]} · ${periodLabel}`;
}

export async function createReportRecord({
  generation,
  now = new Date(),
  projects,
  range,
  scopeLabel,
  tasks,
  type,
}: {
  generation?: ReportGenerationOptions;
  now?: Date;
  projects: Project[];
  range?: { rangeEnd: string; rangeStart: string };
  scopeLabel?: string;
  tasks: Task[];
  type: ReportType;
}): Promise<SavedReport> {
  const { draft, sourceTasks } = buildReportDraft(tasks, projects, type, now, range);
  const polishedContent = await polishReport(draft, type, generation);
  const { rangeEnd, rangeStart } = range ?? getReportRange(type, now);
  const titleDate = range ? new Date(range.rangeStart) : now;

  return {
    createdAt: now.toISOString(),
    draft,
    id: crypto.randomUUID(),
    polishedContent,
    rangeEnd,
    rangeStart,
    sourceTaskIds: sourceTasks.map((task) => task.id),
    title: buildReportTitle(type, titleDate, scopeLabel),
    type,
    updatedAt: now.toISOString(),
  };
}
