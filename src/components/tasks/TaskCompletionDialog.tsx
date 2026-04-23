import { useState } from "react";
import { Modal } from "../common/Modal";

export function TaskCompletionDialog({
  onClose,
  onConfirm,
  taskTitle,
}: {
  onClose: () => void;
  onConfirm: (input: {
    keyChanges: string;
    notes: string;
    summary: string;
  }) => Promise<void>;
  taskTitle: string;
}) {
  const [summary, setSummary] = useState("");
  const [keyChanges, setKeyChanges] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onConfirm({
      keyChanges,
      notes,
      summary,
    });
  }

  return (
    <Modal onClose={onClose} title="标记任务已完成">
      <form className="modal__body" onSubmit={handleSubmit}>
        <p className="modal__lead">为任务「{taskTitle}」补充收尾说明，方便后续生成报告。</p>
        <label className="field">
          <span>完成说明</span>
          <textarea onChange={(event) => setSummary(event.target.value)} rows={3} value={summary} />
        </label>
        <label className="field">
          <span>关键改动</span>
          <textarea
            onChange={(event) => setKeyChanges(event.target.value)}
            rows={3}
            value={keyChanges}
          />
        </label>
        <label className="field">
          <span>备注 / 补充</span>
          <textarea onChange={(event) => setNotes(event.target.value)} rows={3} value={notes} />
        </label>
        <div className="modal__actions">
          <button className="ghost-button" onClick={onClose} type="button">
            取消
          </button>
          <button type="submit">确认完成</button>
        </div>
      </form>
    </Modal>
  );
}
