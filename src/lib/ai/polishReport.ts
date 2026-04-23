import { REPORT_TYPE_LABELS } from "../constants";
import type { ReportDraft, ReportType } from "../../types/report";

function asBulletList(items: string[]) {
  if (items.length === 0) {
    return "- 暂无";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export async function polishReport(draft: ReportDraft, type: ReportType) {
  return [
    `${REPORT_TYPE_LABELS[type]}`,
    "",
    "本期概览",
    draft.overview || "暂无概览。",
    "",
    "完成事项",
    asBulletList(draft.completedItems),
    "",
    "关键改动",
    asBulletList(draft.keyChanges),
    "",
    "风险与阻塞",
    asBulletList(draft.blockers),
    "",
    "后续动作",
    asBulletList(draft.nextSteps),
  ].join("\n");
}
