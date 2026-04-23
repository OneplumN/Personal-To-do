import { useMemo, useState } from "react";
import type { ReportDraft, SavedReport } from "../../types/report";

function toMultiline(items: string[]) {
  return items.join("\n");
}

function fromMultiline(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ReportEditor({
  onSave,
  report,
}: {
  onSave: (update: {
    draft: ReportDraft;
    polishedContent: string;
    title: string;
  }) => Promise<void>;
  report: SavedReport;
}) {
  const [title, setTitle] = useState(report.title);
  const [overview, setOverview] = useState(report.draft.overview);
  const [completedItems, setCompletedItems] = useState(
    toMultiline(report.draft.completedItems),
  );
  const [keyChanges, setKeyChanges] = useState(toMultiline(report.draft.keyChanges));
  const [blockers, setBlockers] = useState(toMultiline(report.draft.blockers));
  const [nextSteps, setNextSteps] = useState(toMultiline(report.draft.nextSteps));
  const [polishedContent, setPolishedContent] = useState(report.polishedContent);

  const draft = useMemo<ReportDraft>(
    () => ({
      blockers: fromMultiline(blockers),
      completedItems: fromMultiline(completedItems),
      keyChanges: fromMultiline(keyChanges),
      nextSteps: fromMultiline(nextSteps),
      overview,
    }),
    [blockers, completedItems, keyChanges, nextSteps, overview],
  );

  return (
    <section className="report-editor">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Report Editor</p>
          <h2>报告内容</h2>
        </div>
        <button
          onClick={() =>
            void onSave({
              draft,
              polishedContent,
              title,
            })
          }
          type="button"
        >
          保存报告
        </button>
      </div>

      <label className="field">
        <span>报告标题</span>
        <input onChange={(event) => setTitle(event.target.value)} value={title} />
      </label>

      <div className="report-editor__grid">
        <label className="field">
          <span>概览</span>
          <textarea onChange={(event) => setOverview(event.target.value)} rows={4} value={overview} />
        </label>
        <label className="field">
          <span>完成事项</span>
          <textarea
            onChange={(event) => setCompletedItems(event.target.value)}
            rows={6}
            value={completedItems}
          />
        </label>
        <label className="field">
          <span>关键改动</span>
          <textarea
            onChange={(event) => setKeyChanges(event.target.value)}
            rows={6}
            value={keyChanges}
          />
        </label>
        <label className="field">
          <span>风险与阻塞</span>
          <textarea onChange={(event) => setBlockers(event.target.value)} rows={5} value={blockers} />
        </label>
        <label className="field">
          <span>后续动作</span>
          <textarea onChange={(event) => setNextSteps(event.target.value)} rows={5} value={nextSteps} />
        </label>
      </div>

      <label className="field">
        <span>润色后正文</span>
        <textarea
          onChange={(event) => setPolishedContent(event.target.value)}
          rows={14}
          value={polishedContent}
        />
      </label>
    </section>
  );
}
