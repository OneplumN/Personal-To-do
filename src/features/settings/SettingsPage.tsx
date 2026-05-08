import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportSnapshot } from "../../lib/export/exportSnapshot";
import { saveTextFile } from "../../lib/desktop/desktopFiles";
import { useToast } from "../../components/common/ToastProvider";
import { usePreferenceStore } from "../preferences/preferenceStore";
import { AiProviderSettings } from "./AiProviderSettings";
import { AiRoleSettings } from "./AiRoleSettings";
import { SettingsExportIcon } from "./settingsIcons";
import { useAiProviderSettings } from "./useAiProviderSettings";
import { useAiRoleSettings } from "./useAiRoleSettings";
import type { ConfirmingDelete } from "./settingsTypes";
import type {
  AiProfile,
  AiRoleTemplate,
} from "../../types/preferences";

const LANE_COLOR_FIELDS = [
  { key: "task", label: "待办", ariaName: "Task" },
  { key: "doing", label: "进行中", ariaName: "Doing" },
  { key: "done", label: "已完成", ariaName: "Done" },
] as const;

const COLOR_PRESETS = [
  "#FFB347",
  "#F97316",
  "#EF4444",
  "#F472B6",
  "#7D8AFF",
  "#5AC8FA",
  "#34D399",
  "#A3E635",
] as const;

type SettingsDomain = "ai" | "aiRoles" | "appearance" | "data";

const SETTINGS_DOMAINS: Array<{
  id: SettingsDomain;
  label: string;
  summary: string;
}> = [
  { id: "ai", label: "大模型", summary: "服务商与模型" },
  { id: "aiRoles", label: "提示词库", summary: "角色与模板" },
  { id: "appearance", label: "外观", summary: "主题与颜色" },
  { id: "data", label: "数据", summary: "备份与数据库" },
];

function getPreferenceDraftSnapshot(preferences: {
  activeAiProfileId: string;
  activeAiRoleTemplateId: string;
  aiEndpoint: string;
  aiKey: string;
  aiProfiles: AiProfile[];
  aiRole: string;
  aiRolePresets: unknown[];
  aiRoleTemplates: AiRoleTemplate[];
  laneColors: unknown;
  theme: string;
}) {
  return JSON.stringify({
    activeAiProfileId: preferences.activeAiProfileId,
    activeAiRoleTemplateId: preferences.activeAiRoleTemplateId,
    aiEndpoint: preferences.aiEndpoint,
    aiKey: preferences.aiKey,
    aiProfiles: preferences.aiProfiles,
    aiRole: preferences.aiRole,
    aiRolePresets: preferences.aiRolePresets,
    aiRoleTemplates: preferences.aiRoleTemplates,
    laneColors: preferences.laneColors,
    theme: preferences.theme,
  });
}

export function SettingsPage() {
  const navigate = useNavigate();
  const preferences = usePreferenceStore((state) => state.preferences);
  const savePreferences = usePreferenceStore((state) => state.savePreferences);
  const { showToast } = useToast();

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState(preferences);
  const [activeSettingsDomain, setActiveSettingsDomain] =
    useState<SettingsDomain>("ai");
  const [confirmingDelete, setConfirmingDelete] = useState<ConfirmingDelete | null>(null);

  const prettyExportName = useMemo(
    () => `yibu-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
    [],
  );
  const aiProviderSettings = useAiProviderSettings({
    confirmingDelete,
    draft,
    savePreferences,
    setConfirmingDelete,
    setDraft,
    showToast,
  });
  const {
    activeAiProfile,
    apiTestResult,
    draftModelName,
    fetchedAiModels,
    handleAddAiModel,
    handleAddAiProfile,
    handleCancelAiProfile,
    handleConfirmAiProfile,
    handleDeleteAiModel,
    handleFetchAiModels,
    handleRequestDeleteAiProfile,
    handleResetActiveAiEndpoint,
    handleSelectAiModel,
    handleSelectAiProfile,
    handleSelectBuiltinAiProvider,
    handleTestActiveApi,
    handleUpdateActiveAiProfile,
    isAiKeyVisible,
    isFetchingModels,
    isTestingApi,
    modelListResult,
    pendingAiProfile,
    setDraftModelName,
    setIsAiKeyVisible,
  } = aiProviderSettings;
  const aiRoleSettings = useAiRoleSettings({
    confirmingDelete,
    draft,
    savePreferences,
    setConfirmingDelete,
    setDraft,
    showToast,
  });
  const {
    activeAiRoleTemplate,
    draftRoleName,
    handleAddAiRoleTemplate,
    handleCancelAiRoleTemplate,
    handleConfirmAiRoleTemplate,
    handleRequestDeleteAiRoleTemplate,
    handleSelectAiRoleTemplate,
    handleUpdateAiRole,
    handleUpdateAiRoleName,
    pendingAiRoleTemplate,
    syncRoleName,
  } = aiRoleSettings;
  const hasPendingAiItem = Boolean(pendingAiProfile || pendingAiRoleTemplate);
  const hasUnsavedChanges = useMemo(
    () => getPreferenceDraftSnapshot(draft) !== getPreferenceDraftSnapshot(preferences),
    [draft, preferences],
  );
  const isGlobalSaveDisabled = hasPendingAiItem || !hasUnsavedChanges;
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, []);

  async function handleSave() {
    if (hasPendingAiItem) {
      showToast({ message: "请先确认或取消正在编辑的 AI 项" });
      return;
    }

    const savedPreferences = await savePreferences({
      activeAiProfileId: draft.activeAiProfileId,
      activeAiRoleTemplateId: draft.activeAiRoleTemplateId,
      aiEndpoint: draft.aiEndpoint,
      aiKey: draft.aiKey,
      aiProfiles: draft.aiProfiles,
      aiRole: draft.aiRole,
      aiRolePresets: draft.aiRolePresets,
      aiRoleTemplates: draft.aiRoleTemplates,
      laneColors: draft.laneColors,
      theme: draft.theme,
    });
    setDraft(savedPreferences);
    syncRoleName(savedPreferences);
    showToast({ message: "已保存" });
  }

  async function handleExport() {
    const snapshot = await exportSnapshot();
    const contents = JSON.stringify(snapshot, null, 2);
    const savedThroughDesktop = await saveTextFile({
      contents,
      defaultPath: prettyExportName,
    });
    if (savedThroughDesktop) {
      showToast({ message: "已导出" });
      return;
    }

    const blob = new Blob([contents], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = prettyExportName;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast({ message: "已导出" });
  }

  function updateLaneColor(key: keyof typeof draft.laneColors, value: string) {
    setDraft((current) => ({
      ...current,
      laneColors: { ...current.laneColors, [key]: value },
    }));
  }

  return (
    <div className="settings-page">
      <section
        aria-label="设置"
        className="settings-modal"
      >
        <header className="settings-modal__header">
          <div className="settings-header__title">
            <h3>设置</h3>
          </div>
        </header>
        <div className="settings-modal__body settings-dialog" ref={bodyRef}>
          <div className="settings-workbench">
            <aside className="settings-sidebar" aria-label="设置分类">
              {SETTINGS_DOMAINS.map((domain) => (
                <button
                  aria-current={activeSettingsDomain === domain.id ? "page" : undefined}
                  className={
                    activeSettingsDomain === domain.id
                      ? "settings-domain settings-domain--active"
                      : "settings-domain"
                  }
                  key={domain.id}
                  onClick={() => {
                    setActiveSettingsDomain(domain.id);
                    if (bodyRef.current) {
                      bodyRef.current.scrollTop = 0;
                    }
                  }}
                  type="button"
                >
                  <strong>{domain.label}</strong>
                  <span>{domain.summary}</span>
                </button>
              ))}
            </aside>
            <div className="settings-panel">
              {activeSettingsDomain === "appearance" ? (
                <section className="settings-section" id="settings-colors">
              <div className="detail-section__header">
                <h4>外观</h4>
              </div>
              <div className="settings-section-note">
                <strong>看板颜色</strong>
                <span>调整任务状态在首页和项目看板里的识别色。</span>
              </div>
              <div className="settings-color-panel">
                {LANE_COLOR_FIELDS.map((field) => {
                  const value = draft.laneColors[field.key];
                  return (
                    <div className="settings-color-card" key={field.key}>
                      <span
                        aria-hidden="true"
                        className="settings-color-card__swatch"
                        style={{ background: value }}
                      />
                      <label className="field settings-color-card__field">
                        <span>{field.label}</span>
                        <input
                          aria-label={`${field.ariaName} color`}
                          onChange={(event) => updateLaneColor(field.key, event.target.value)}
                          value={value}
                        />
                      </label>
                      <div
                        aria-label={`${field.label}颜色预设`}
                        className="settings-color-card__presets"
                      >
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            aria-label={`${field.label}使用${preset}`}
                            aria-pressed={value.toLowerCase() === preset.toLowerCase()}
                            className={
                              value.toLowerCase() === preset.toLowerCase()
                                ? "settings-color-preset settings-color-preset--active"
                                : "settings-color-preset"
                            }
                            key={preset}
                            onClick={() => updateLaneColor(field.key, preset)}
                            style={{ background: preset }}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
                </section>
              ) : null}

              {activeSettingsDomain === "ai" ? (
                <AiProviderSettings
                  activeAiProfile={activeAiProfile}
                  apiTestResult={apiTestResult}
                  confirmingDelete={confirmingDelete}
                  draft={draft}
                  draftModelName={draftModelName}
                  fetchedAiModels={fetchedAiModels}
                  isAiKeyVisible={isAiKeyVisible}
                  isFetchingModels={isFetchingModels}
                  isTestingApi={isTestingApi}
                  modelListResult={modelListResult}
                  pendingAiProfile={pendingAiProfile}
                  onAddAiModel={handleAddAiModel}
                  onAddAiProfile={handleAddAiProfile}
                  onCancelAiProfile={handleCancelAiProfile}
                  onConfirmAiProfile={() => {
                    void handleConfirmAiProfile();
                  }}
                  onDeleteAiModel={handleDeleteAiModel}
                  onFetchAiModels={() => {
                    void handleFetchAiModels();
                  }}
                  onRequestDeleteAiProfile={handleRequestDeleteAiProfile}
                  onResetActiveAiEndpoint={handleResetActiveAiEndpoint}
                  onSelectAiModel={handleSelectAiModel}
                  onSelectAiProfile={handleSelectAiProfile}
                  onSelectBuiltinAiProvider={handleSelectBuiltinAiProvider}
                  onSetDraftModelName={setDraftModelName}
                  onTestActiveApi={() => {
                    void handleTestActiveApi();
                  }}
                  onToggleAiKeyVisibility={() =>
                    setIsAiKeyVisible((current) => !current)
                  }
                  onUpdateActiveAiProfile={handleUpdateActiveAiProfile}
                />
              ) : null}

              {activeSettingsDomain === "aiRoles" ? (
                <AiRoleSettings
                  activeAiRoleTemplate={activeAiRoleTemplate}
                  confirmingDelete={confirmingDelete}
                  draft={draft}
                  draftRoleName={draftRoleName}
                  pendingAiRoleTemplate={pendingAiRoleTemplate}
                  onAddAiRoleTemplate={handleAddAiRoleTemplate}
                  onCancelAiRoleTemplate={handleCancelAiRoleTemplate}
                  onConfirmAiRoleTemplate={() => {
                    void handleConfirmAiRoleTemplate();
                  }}
                  onRequestDeleteAiRoleTemplate={handleRequestDeleteAiRoleTemplate}
                  onSelectAiRoleTemplate={(templateId) => {
                    void handleSelectAiRoleTemplate(templateId);
                  }}
                  onUpdateAiRole={handleUpdateAiRole}
                  onUpdateAiRoleName={handleUpdateAiRoleName}
                />
              ) : null}

              {activeSettingsDomain === "data" ? (
                <section className="settings-section" id="settings-data">
              <div className="detail-section__header">
                <h4>数据</h4>
              </div>
              <div className="settings-data-panel">
                <div className="settings-data-row">
                  <span>
                    <strong>创建备份</strong>
                    <small>导出完整 JSON 快照，可用于迁移和人工留档。</small>
                  </span>
                  <button
                    aria-label="创建备份"
                    className="settings-action-card settings-action-card--button"
                    onClick={() => void handleExport()}
                    type="button"
                  >
                    <SettingsExportIcon />
                    <span>导出</span>
                  </button>
                </div>
                <div className="settings-data-row">
                  <span>
                    <strong>恢复数据</strong>
                    <small>从快照恢复会覆盖当前本地数据，后续接入文件选择。</small>
                  </span>
                  <button
                    className="settings-action-card settings-action-card--button"
                    disabled
                    type="button"
                  >
                    待接入
                  </button>
                </div>
                <div className="settings-data-row settings-data-row--quiet">
                  <span>
                    <strong>本地数据库</strong>
                    <small>桌面端使用本地存储，备份文件不会自动上传。</small>
                  </span>
                  <em>本机</em>
                </div>
              </div>
                </section>
              ) : null}

            </div>
          </div>
        </div>

        <footer className="settings-modal__footer settings-footer">
          <button
            aria-label="关闭"
            className="settings-footer__button settings-footer__button--secondary"
            onClick={() => {
              void navigate("/");
            }}
            title="返回首页"
            type="button"
          >
            取消
          </button>
          <button
            aria-label="保存"
            className="settings-footer__button settings-footer__button--primary"
            disabled={isGlobalSaveDisabled}
            onClick={() => {
              void handleSave();
            }}
            title="保存设置"
            type="button"
          >
            保存
          </button>
        </footer>
      </section>
    </div>
  );
}
