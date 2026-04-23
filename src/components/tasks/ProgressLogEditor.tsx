import { useState } from "react";
import type { Task } from "../../types/task";

export function ProgressLogEditor({
  onAppendLog,
  task,
}: {
  onAppendLog: (content: string) => Promise<void>;
  task: Task;
}) {
  const [draft, setDraft] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAppendLog(draft);
    setDraft("");
  }

  return (
    <section className="detail-section">
      <div className="detail-section__header">
        <h4>进展 / 修改记录</h4>
      </div>
      <div className="progress-log">
        <form className="inline-form inline-form--stacked" onSubmit={handleSubmit}>
          <textarea
            onChange={(event) => setDraft(event.target.value)}
            placeholder="补充一条最新进展或修改记录"
            rows={3}
            value={draft}
          />
          <div className="inline-form__actions">
            <button type="submit">追加记录</button>
          </div>
        </form>
        <div className="progress-log__items">
          {task.progressLog.map((entry) => (
            <article className="progress-log__item" key={entry.id}>
              <p>{entry.content}</p>
              <span>{new Date(entry.createdAt).toLocaleString("zh-CN")}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
