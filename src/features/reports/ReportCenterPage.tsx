import { useMemo, useState } from "react";
import { REPORT_TYPE_LABELS } from "../../lib/constants";
import { buildReportDraft, getReportRange } from "../../lib/ai/buildReportDraft";
import { polishReport } from "../../lib/ai/polishReport";
import { useProjectStore } from "../projects/projectStore";
import { useReportStore } from "./reportStore";
import { useTaskStore } from "../tasks/taskStore";
import type { ReportType, SavedReport } from "../../types/report";
import { ReportEditor } from "../../components/reports/ReportEditor";

function buildReportTitle(type: ReportType, now = new Date()) {
  if (type === "daily") {
    return `${REPORT_TYPE_LABELS[type]} · ${now.toLocaleDateString("zh-CN")}`;
  }
  if (type === "weekly") {
    return `${REPORT_TYPE_LABELS[type]} · ${now.getFullYear()}-W${Math.ceil(
      (now.getDate() + (new Date(now.getFullYear(), now.getMonth(), 1).getDay() || 7) - 1) / 7,
    )}`;
  }
  return `${REPORT_TYPE_LABELS[type]} · ${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
}

export function ReportCenterPage() {
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const reports = useReportStore((state) => state.reports);
  const saveReport = useReportStore((state) => state.saveReport);
  const updateReport = useReportStore((state) => state.updateReport);

  const [activeType, setActiveType] = useState<ReportType>("daily");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const activeReport = useMemo(
    () => reports.find((report) => report.id === activeReportId) ?? null,
    [activeReportId, reports],
  );

  async function handleGenerate() {
    const now = new Date();
    const { draft, sourceTasks } = buildReportDraft(tasks, projects, activeType, now);
    const polishedContent = await polishReport(draft, activeType);
    const { rangeEnd, rangeStart } = getReportRange(activeType, now);
    const report: SavedReport = {
      createdAt: now.toISOString(),
      draft,
      id: crypto.randomUUID(),
      polishedContent,
      rangeEnd,
      rangeStart,
      sourceTaskIds: sourceTasks.map((task) => task.id),
      title: buildReportTitle(activeType, now),
      type: activeType,
      updatedAt: now.toISOString(),
    };

    await saveReport(report);
    setActiveReportId(report.id);
  }

  return (
    <div className="report-center">
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Report Center</p>
            <h2>报告中心</h2>
          </div>
          <div className="task-workspace-header__actions">
            <div className="segmented-control" role="tablist">
              {(["daily", "weekly", "monthly"] as ReportType[]).map((type) => (
                <button
                  className={
                    activeType === type
                      ? "segmented-control__button segmented-control__button--active"
                      : "segmented-control__button"
                  }
                  key={type}
                  onClick={() => setActiveType(type)}
                  type="button"
                >
                  {REPORT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <button onClick={() => void handleGenerate()} type="button">
              生成{REPORT_TYPE_LABELS[activeType]}
            </button>
          </div>
        </div>

        <div className="report-list">
          {reports.length === 0 ? (
            <div className="empty-state">
              <h3>还没有生成过报告</h3>
              <p>报告只会读取已完成任务，生成后会保存在这里并支持继续编辑。</p>
            </div>
          ) : (
            reports.map((report) => (
              <button
                className="report-list-item"
                key={report.id}
                onClick={() => setActiveReportId(report.id)}
                type="button"
              >
                <div>
                  <h3>{report.title}</h3>
                  <p>
                    来源任务 {report.sourceTaskIds.length} 条 · {REPORT_TYPE_LABELS[report.type]}
                  </p>
                </div>
                <span>{new Date(report.updatedAt).toLocaleString("zh-CN")}</span>
              </button>
            ))
          )}
        </div>
      </section>

      {activeReport ? (
        <ReportEditor
          onSave={async (update) => {
            await updateReport(activeReport.id, update);
          }}
          report={activeReport}
        />
      ) : null}
    </div>
  );
}
