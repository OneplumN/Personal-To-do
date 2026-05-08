import { AI_PROVIDER_PRESETS } from "../../lib/constants";
import type {
  AiProfile,
  AiProviderPreset,
  Preferences,
} from "../../types/preferences";
import type { ApiTestResult, ModelListResult } from "../../lib/ai/llmClient";
import type { ConfirmingDelete, PendingAiProfile } from "./settingsTypes";
import {
  SettingsAddIcon,
  SettingsCloseIcon,
  SettingsEyeIcon,
  SettingsEyeOffIcon,
  SettingsSaveIcon,
} from "./settingsIcons";

const BUILTIN_AI_PRESET_OPTIONS = [
  { label: "DeepSeek", value: "deepseek" },
  { label: "Kimi", value: "kimi" },
  { label: "MiniMax", value: "minimax" },
  { label: "千问", value: "qwen" },
  { label: "智谱", value: "bigmodel" },
] as const;

type AiProviderSettingsProps = {
  activeAiProfile: AiProfile;
  apiTestResult: ApiTestResult | null;
  confirmingDelete: ConfirmingDelete | null;
  draft: Preferences;
  draftModelName: string;
  fetchedAiModels: string[];
  isAiKeyVisible: boolean;
  isFetchingModels: boolean;
  isTestingApi: boolean;
  modelListResult: ModelListResult | null;
  pendingAiProfile: PendingAiProfile | null;
  onAddAiModel: (model: string) => void;
  onAddAiProfile: () => void;
  onCancelAiProfile: () => void;
  onConfirmAiProfile: () => void;
  onDeleteAiModel: (model: string) => void;
  onFetchAiModels: () => void;
  onRequestDeleteAiProfile: (profileId: string) => void;
  onResetActiveAiEndpoint: () => void;
  onSelectAiModel: (model: string) => void;
  onSelectAiProfile: (profileId: string) => void;
  onSelectBuiltinAiProvider: (preset: Exclude<AiProviderPreset, "custom">) => void;
  onSetDraftModelName: (model: string) => void;
  onTestActiveApi: () => void;
  onToggleAiKeyVisibility: () => void;
  onUpdateActiveAiProfile: (update: Partial<AiProfile>) => void;
};

export function AiProviderSettings({
  activeAiProfile,
  apiTestResult,
  confirmingDelete,
  draft,
  draftModelName,
  fetchedAiModels,
  isAiKeyVisible,
  isFetchingModels,
  isTestingApi,
  modelListResult,
  pendingAiProfile,
  onAddAiModel,
  onAddAiProfile,
  onCancelAiProfile,
  onConfirmAiProfile,
  onDeleteAiModel,
  onFetchAiModels,
  onRequestDeleteAiProfile,
  onResetActiveAiEndpoint,
  onSelectAiModel,
  onSelectAiProfile,
  onSelectBuiltinAiProvider,
  onSetDraftModelName,
  onTestActiveApi,
  onToggleAiKeyVisibility,
  onUpdateActiveAiProfile,
}: AiProviderSettingsProps) {
  return (
    <section className="settings-section" id="settings-ai">
      <div className="detail-section__header">
        <h4>大模型</h4>
      </div>
      <div className="settings-ai-grid">
        <div className="settings-ai-block settings-ai-block--model">
          <div className="settings-ai-provider-workbench">
            <aside className="settings-ai-provider-rail" aria-label="AI 服务商">
              <button
                aria-label="新增服务商"
                className="settings-ai-provider-add"
                disabled={Boolean(pendingAiProfile)}
                onClick={onAddAiProfile}
                title="新增服务商"
                type="button"
              >
                <SettingsAddIcon />
                <span>新增服务商</span>
              </button>
              <div className="settings-ai-provider-group">
                <span>内置</span>
                {BUILTIN_AI_PRESET_OPTIONS.map((preset) => {
                  const configuredProfile = draft.aiProfiles.find(
                    (profile) => profile.preset === preset.value,
                  );
                  const isConfirming =
                    configuredProfile &&
                    confirmingDelete?.type === "aiProfile" &&
                    confirmingDelete.id === configuredProfile.id;
                  return (
                    <div className="settings-ai-provider-card" key={preset.value}>
                      <button
                        aria-pressed={activeAiProfile.preset === preset.value}
                        className={
                          activeAiProfile.preset === preset.value
                            ? "settings-ai-provider settings-ai-provider--active"
                            : "settings-ai-provider"
                        }
                        disabled={Boolean(pendingAiProfile)}
                        onClick={() => onSelectBuiltinAiProvider(preset.value)}
                        type="button"
                      >
                        <strong>{preset.label}</strong>
                        <small>
                          {isConfirming
                            ? "再次点击删除"
                            : configuredProfile
                              ? "已配置"
                              : "未配置"}
                        </small>
                      </button>
                      {configuredProfile && draft.aiProfiles.length > 1 ? (
                        <button
                          aria-label={`删除服务商 ${preset.label}`}
                          className={
                            isConfirming
                              ? "settings-ai-provider-delete settings-ai-provider-delete--confirm"
                              : "settings-ai-provider-delete"
                          }
                          disabled={Boolean(pendingAiProfile)}
                          onClick={() => onRequestDeleteAiProfile(configuredProfile.id)}
                          title={isConfirming ? "再次点击删除" : "删除服务商"}
                          type="button"
                        >
                          <SettingsCloseIcon />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="settings-ai-provider-group">
                <span>自定义</span>
                {draft.aiProfiles
                  .filter((profile) => profile.preset === "custom")
                  .map((profile) => {
                    const isConfirming =
                      confirmingDelete?.type === "aiProfile" &&
                      confirmingDelete.id === profile.id;
                    return (
                      <div className="settings-ai-provider-card" key={profile.id}>
                        <button
                          aria-label={profile.name}
                          aria-pressed={profile.id === draft.activeAiProfileId}
                          className={
                            profile.id === draft.activeAiProfileId
                              ? "settings-ai-provider settings-ai-provider--active"
                              : "settings-ai-provider"
                          }
                          disabled={Boolean(
                            pendingAiProfile && profile.id !== pendingAiProfile.id,
                          )}
                          onClick={() => onSelectAiProfile(profile.id)}
                          type="button"
                        >
                          <strong>{profile.name}</strong>
                          <small>
                            {isConfirming
                              ? "再次点击删除"
                              : profile.endpoint || "自定义地址"}
                          </small>
                        </button>
                        {draft.aiProfiles.length > 1 ? (
                          <button
                            aria-label={`删除服务商 ${profile.name}`}
                            className={
                              isConfirming
                                ? "settings-ai-provider-delete settings-ai-provider-delete--confirm"
                                : "settings-ai-provider-delete"
                            }
                            disabled={Boolean(
                              pendingAiProfile && profile.id !== pendingAiProfile.id,
                            )}
                            onClick={() => onRequestDeleteAiProfile(profile.id)}
                            title={isConfirming ? "再次点击删除" : "删除服务商"}
                            type="button"
                          >
                            <SettingsCloseIcon />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </aside>

            <div className="settings-ai-provider-detail">
              <div
                className={
                  activeAiProfile.preset === "custom"
                    ? "settings-ai-fields settings-ai-fields--model settings-ai-fields--custom-provider"
                    : "settings-ai-fields settings-ai-fields--model settings-ai-fields--builtin-provider"
                }
              >
                {activeAiProfile.preset === "custom" ? (
                  <label className="field settings-ai-name-field">
                    <span>名称</span>
                    <input
                      aria-label="AI 配置名称"
                      onChange={(event) =>
                        onUpdateActiveAiProfile({ name: event.target.value })
                      }
                      value={activeAiProfile.name}
                    />
                  </label>
                ) : null}
                <div className="field settings-ai-endpoint-field">
                  <span>服务地址</span>
                  <div className="settings-ai-endpoint-control">
                    <input
                      aria-label="AI 服务地址"
                      onChange={(event) =>
                        onUpdateActiveAiProfile({ endpoint: event.target.value })
                      }
                      placeholder="https://api.example.com"
                      value={activeAiProfile.endpoint}
                    />
                    {activeAiProfile.preset !== "custom" ? (
                      <button
                        className="settings-ai-test-button"
                        disabled={
                          activeAiProfile.endpoint ===
                          AI_PROVIDER_PRESETS[activeAiProfile.preset].endpoint
                        }
                        onClick={onResetActiveAiEndpoint}
                        type="button"
                      >
                        恢复默认
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="field settings-secret-field">
                  <span>API 密钥</span>
                  <div className="settings-secret-input">
                    <input
                      aria-label="AI 密钥"
                      onChange={(event) =>
                        onUpdateActiveAiProfile({ apiKey: event.target.value })
                      }
                      type={isAiKeyVisible ? "text" : "password"}
                      value={activeAiProfile.apiKey}
                    />
                    <button
                      aria-label={isAiKeyVisible ? "隐藏 AI 密钥" : "显示 AI 密钥"}
                      className="settings-secret-toggle"
                      onClick={onToggleAiKeyVisibility}
                      type="button"
                    >
                      {isAiKeyVisible ? <SettingsEyeOffIcon /> : <SettingsEyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="field settings-ai-endpoint-field">
                  <span>模型列表地址</span>
                  <input
                    aria-label="AI 模型列表地址"
                    onChange={(event) =>
                      onUpdateActiveAiProfile({
                        modelsEndpoint: event.target.value,
                      })
                    }
                    placeholder="留空时自动尝试 /v1/models 和 /models"
                    value={activeAiProfile.modelsEndpoint}
                  />
                </div>

                <div className="field settings-ai-models-field">
                  <span>模型</span>
                  <div className="settings-ai-models-control">
                    <input
                      aria-label="AI 模型"
                      onChange={(event) => onSetDraftModelName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          onAddAiModel(draftModelName);
                        }
                      }}
                      placeholder="输入模型 ID"
                      value={draftModelName}
                    />
                    <button
                      aria-label="添加模型"
                      className="settings-ai-tool-button"
                      disabled={!draftModelName.trim()}
                      onClick={() => onAddAiModel(draftModelName)}
                      title="添加模型"
                      type="button"
                    >
                      <SettingsAddIcon />
                    </button>
                    <button
                      className="settings-ai-tool-button settings-ai-tool-button--text"
                      disabled={isFetchingModels}
                      onClick={onFetchAiModels}
                      type="button"
                    >
                      {isFetchingModels ? "获取中..." : "获取模型"}
                    </button>
                  </div>
                </div>

                <div className="field settings-ai-models-field settings-ai-models-field--saved">
                  <span>已保存模型</span>
                  <div
                    className="settings-ai-models-list settings-ai-models-list--saved"
                    aria-label="已保存模型"
                  >
                    {activeAiProfile.models.length > 0 ? (
                      activeAiProfile.models.map((model) => (
                        <div
                          className={
                            model === activeAiProfile.model
                              ? "settings-ai-model-row settings-ai-model-row--saved settings-ai-model-row--current"
                              : "settings-ai-model-row settings-ai-model-row--saved"
                          }
                          key={model}
                        >
                          <button
                            aria-pressed={model === activeAiProfile.model}
                            className={
                              model === activeAiProfile.model
                                ? "settings-ai-model-select settings-ai-model-select--active"
                                : "settings-ai-model-select"
                            }
                            onClick={() => onSelectAiModel(model)}
                            title={model}
                            type="button"
                          >
                            <span>{model}</span>
                          </button>
                          <button
                            aria-label={`删除模型 ${model}`}
                            className="settings-ai-row-action"
                            onClick={() => onDeleteAiModel(model)}
                            title="删除模型"
                            type="button"
                          >
                            <SettingsCloseIcon />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="settings-ai-empty">暂无模型</p>
                    )}
                  </div>
                </div>

                {modelListResult ? (
                  modelListResult.ok ? (
                    <div className="field settings-ai-models-field settings-ai-models-field--available">
                      <span>可用模型</span>
                      <p className="settings-ai-hint">来源：{modelListResult.url}</p>
                      <div
                        className="settings-ai-models-list settings-ai-models-list--available"
                        aria-label="获取到的模型"
                      >
                        {fetchedAiModels.length > 0 ? (
                          fetchedAiModels.map((model) => (
                            <div
                              className="settings-ai-model-row settings-ai-model-row--available"
                              key={model}
                            >
                              <div
                                className="settings-ai-model-select settings-ai-model-select--readonly"
                                title={model}
                              >
                                <span>{model}</span>
                              </div>
                              <button
                                aria-label={`添加获取到的模型 ${model}`}
                                className="settings-ai-row-action settings-ai-row-action--add"
                                onClick={() => onAddAiModel(model)}
                                title="添加模型"
                                type="button"
                              >
                                <SettingsAddIcon />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="settings-ai-empty">
                            没有发现模型，请手动添加或确认服务支持模型列表接口。
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="settings-ai-test-result settings-ai-test-result--error">
                      <strong>获取模型失败</strong>
                      <small>
                        {`${modelListResult.status || "ERR"} · ${
                          modelListResult.url ? `${modelListResult.url} · ` : ""
                        }${modelListResult.error}`}
                      </small>
                    </div>
                  )
                ) : null}

                <div className="settings-ai-actions">
                  <button
                    className="settings-ai-test-button settings-ai-test-button--primary"
                    disabled={isTestingApi}
                    onClick={onTestActiveApi}
                    type="button"
                  >
                    {isTestingApi ? "测试中..." : "测试连接"}
                  </button>
                  {pendingAiProfile ? (
                    <div className="settings-ai-card-actions">
                      <button
                        aria-label="创建服务商"
                        className="settings-ai-card-action settings-ai-card-action--confirm settings-ai-card-action--text"
                        onClick={onConfirmAiProfile}
                        title="创建服务商"
                        type="button"
                      >
                        <SettingsSaveIcon />
                        <span>创建</span>
                      </button>
                      <button
                        aria-label="取消服务商"
                        className="settings-ai-card-action settings-ai-card-action--cancel settings-ai-card-action--text"
                        onClick={onCancelAiProfile}
                        title="取消服务商"
                        type="button"
                      >
                        <SettingsCloseIcon />
                        <span>取消</span>
                      </button>
                    </div>
                  ) : null}
                </div>
                {apiTestResult ? (
                  <div
                    className={
                      apiTestResult.ok
                        ? "settings-ai-test-result settings-ai-test-result--ok"
                        : "settings-ai-test-result settings-ai-test-result--error"
                    }
                  >
                    <strong>{apiTestResult.ok ? "连接成功" : "连接失败"}</strong>
                    <small>
                      {apiTestResult.ok
                        ? `${apiTestResult.status} OK · ${apiTestResult.elapsedMs}ms · ${apiTestResult.content}`
                        : `${apiTestResult.status || "ERR"} · ${apiTestResult.elapsedMs}ms · ${apiTestResult.error}`}
                    </small>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
