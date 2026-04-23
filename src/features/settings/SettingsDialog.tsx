import { useMemo, useRef, useState } from "react";
import { exportSnapshot } from "../../lib/export/exportSnapshot";
import { importSnapshot } from "../../lib/import/importSnapshot";
import { useFocusStore } from "../focus/focusStore";
import { usePreferenceStore } from "../preferences/preferenceStore";
import { useProjectStore } from "../projects/projectStore";
import { useReportStore } from "../reports/reportStore";
import { useTaskStore } from "../tasks/taskStore";
import { Drawer } from "../../components/common/Drawer";

export function SettingsDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const preferences = usePreferenceStore((state) => state.preferences);
  const savePreferences = usePreferenceStore((state) => state.savePreferences);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadFocus = useFocusStore((state) => state.loadFocus);
  const loadReports = useReportStore((state) => state.loadReports);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState(preferences);
  const [message, setMessage] = useState<string>("");

  const prettyExportName = useMemo(
    () => `personal-to-do-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
    [],
  );

  async function handleSave() {
    await savePreferences({
      aiEndpoint: draft.aiEndpoint,
      aiKey: draft.aiKey,
      aiRole: draft.aiRole,
      laneColors: draft.laneColors,
      theme: draft.theme,
    });
    setMessage("设置已保存。");
  }

  async function handleExport() {
    const snapshot = await exportSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = prettyExportName;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("已导出快照。");
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const snapshot = JSON.parse(text);
    await importSnapshot(snapshot);
    await Promise.all([loadProjects(), loadTasks(), loadFocus(), loadReports()]);
    await usePreferenceStore.getState().loadPreferences();
    setDraft(usePreferenceStore.getState().preferences);
    setMessage("已导入快照。");
  }

  return (
    <Drawer onClose={onClose} title="设置">
      <header className="drawer__header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h3>设置</h3>
        </div>
        <button
          aria-label="关闭设置"
          className="icon-button"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </header>

      <div className="drawer__body settings-dialog">
        <section className="detail-section">
          <div className="detail-section__header">
            <h4>外观</h4>
          </div>
          <label className="field">
            <span>主题</span>
            <select
              aria-label="主题"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  theme: event.target.value as "dark" | "light",
                }))
              }
              value={draft.theme}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>
        </section>

        <section className="detail-section">
          <div className="detail-section__header">
            <h4>列颜色</h4>
          </div>
          <div className="settings-grid">
            <label className="field">
              <span>任务列</span>
              <input
                aria-label="任务列颜色"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    laneColors: { ...current.laneColors, task: event.target.value },
                  }))
                }
                value={draft.laneColors.task}
              />
            </label>
            <label className="field">
              <span>进行中列</span>
              <input
                aria-label="进行中列颜色"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    laneColors: { ...current.laneColors, doing: event.target.value },
                  }))
                }
                value={draft.laneColors.doing}
              />
            </label>
            <label className="field">
              <span>已完成列</span>
              <input
                aria-label="已完成列颜色"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    laneColors: { ...current.laneColors, done: event.target.value },
                  }))
                }
                value={draft.laneColors.done}
              />
            </label>
          </div>
        </section>

        <section className="detail-section">
          <div className="detail-section__header">
            <h4>AI 设置</h4>
          </div>
          <label className="field">
            <span>AI Endpoint</span>
            <input
              aria-label="AI Endpoint"
              onChange={(event) =>
                setDraft((current) => ({ ...current, aiEndpoint: event.target.value }))
              }
              value={draft.aiEndpoint}
            />
          </label>
          <label className="field">
            <span>AI Key</span>
            <input
              aria-label="AI Key"
              onChange={(event) =>
                setDraft((current) => ({ ...current, aiKey: event.target.value }))
              }
              value={draft.aiKey}
            />
          </label>
          <label className="field">
            <span>AI Role</span>
            <textarea
              aria-label="AI Role"
              onChange={(event) =>
                setDraft((current) => ({ ...current, aiRole: event.target.value }))
              }
              rows={4}
              value={draft.aiRole}
            />
          </label>
        </section>

        <section className="detail-section">
          <div className="detail-section__header">
            <h4>导入 / 导出</h4>
          </div>
          <div className="settings-actions">
            <button onClick={() => void handleExport()} type="button">
              导出快照
            </button>
            <button onClick={() => fileInputRef.current?.click()} type="button">
              导入快照
            </button>
            <input
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImport(file);
                }
              }}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </section>

        {message ? <p className="settings-message">{message}</p> : null}
      </div>

      <footer className="drawer__footer">
        <button className="ghost-button" onClick={onClose} type="button">
          关闭
        </button>
        <button onClick={() => void handleSave()} type="button">
          保存设置
        </button>
      </footer>
    </Drawer>
  );
}
