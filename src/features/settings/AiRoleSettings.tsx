import type { AiRoleTemplate, Preferences } from "../../types/preferences";
import type { ConfirmingDelete, PendingAiRoleTemplate } from "./settingsTypes";
import {
  SettingsAddIcon,
  SettingsCloseIcon,
  SettingsSaveIcon,
} from "./settingsIcons";

type AiRoleSettingsProps = {
  activeAiRoleTemplate: AiRoleTemplate | undefined;
  confirmingDelete: ConfirmingDelete | null;
  draft: Preferences;
  draftRoleName: string;
  pendingAiRoleTemplate: PendingAiRoleTemplate | null;
  onAddAiRoleTemplate: () => void;
  onCancelAiRoleTemplate: () => void;
  onConfirmAiRoleTemplate: () => void;
  onRequestDeleteAiRoleTemplate: (templateId: string) => void;
  onSelectAiRoleTemplate: (templateId: string) => void;
  onUpdateAiRole: (prompt: string) => void;
  onUpdateAiRoleName: (name: string) => void;
};

export function AiRoleSettings({
  activeAiRoleTemplate,
  confirmingDelete,
  draft,
  draftRoleName,
  pendingAiRoleTemplate,
  onAddAiRoleTemplate,
  onCancelAiRoleTemplate,
  onConfirmAiRoleTemplate,
  onRequestDeleteAiRoleTemplate,
  onSelectAiRoleTemplate,
  onUpdateAiRole,
  onUpdateAiRoleName,
}: AiRoleSettingsProps) {
  const customTemplates = draft.aiRoleTemplates.filter((template) => !template.builtIn);

  return (
    <section className="settings-section" id="settings-ai-roles">
      <div className="detail-section__header">
        <h4>提示词库</h4>
      </div>
      <div className="settings-ai-role-workbench">
        <aside className="settings-ai-role-rail" aria-label="提示词模板">
          <button
            aria-label="新增提示词"
            className="settings-ai-provider-add settings-ai-role-add"
            disabled={Boolean(pendingAiRoleTemplate)}
            onClick={onAddAiRoleTemplate}
            title="新增提示词"
            type="button"
          >
            <SettingsAddIcon />
            <span>新增提示词</span>
          </button>
          <div className="settings-ai-provider-group">
            <span>自定义提示词</span>
            {customTemplates.length === 0 ? (
              <p className="settings-ai-empty">暂无提示词</p>
            ) : (
              customTemplates.map((template) => {
                const isConfirming =
                  confirmingDelete?.type === "aiRoleTemplate" &&
                  confirmingDelete.id === template.id;
                return (
                  <div className="settings-ai-provider-card" key={template.id}>
                    <button
                      aria-pressed={template.id === draft.activeAiRoleTemplateId}
                      className={
                        template.id === draft.activeAiRoleTemplateId
                          ? "settings-ai-provider settings-ai-provider--active"
                          : "settings-ai-provider"
                      }
                      disabled={Boolean(
                        pendingAiRoleTemplate &&
                          template.id !== pendingAiRoleTemplate.id,
                      )}
                      onClick={() => onSelectAiRoleTemplate(template.id)}
                      type="button"
                    >
                      <strong>{template.name}</strong>
                      <small>
                        {isConfirming
                          ? "再次点击删除"
                          : template.id === draft.activeAiRoleTemplateId
                            ? "当前"
                            : "使用"}
                      </small>
                    </button>
                    <button
                      aria-label={`删除提示词 ${template.name}`}
                      className={
                        isConfirming
                          ? "settings-ai-provider-delete settings-ai-provider-delete--confirm"
                          : "settings-ai-provider-delete"
                      }
                      disabled={Boolean(
                        pendingAiRoleTemplate &&
                          template.id !== pendingAiRoleTemplate.id,
                      )}
                      onClick={() => onRequestDeleteAiRoleTemplate(template.id)}
                      title={isConfirming ? "再次点击删除" : "删除提示词"}
                      type="button"
                    >
                      <SettingsCloseIcon />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
        <div className="settings-ai-role-detail">
          <div className="settings-ai-provider-detail__header">
            <div>
              <span>当前提示词</span>
              <strong>{activeAiRoleTemplate?.name ?? "自定义"}</strong>
            </div>
            <div className="settings-ai-card-actions">
              {pendingAiRoleTemplate ? (
                <>
                  <button
                    aria-label="创建提示词"
                    className="settings-ai-card-action settings-ai-card-action--confirm"
                    onClick={onConfirmAiRoleTemplate}
                    title="创建提示词"
                    type="button"
                  >
                    <SettingsSaveIcon />
                  </button>
                  <button
                    aria-label="取消提示词"
                    className="settings-ai-card-action settings-ai-card-action--cancel"
                    onClick={onCancelAiRoleTemplate}
                    title="取消提示词"
                    type="button"
                  >
                    <SettingsCloseIcon />
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div className="settings-ai-fields settings-ai-fields--role">
            <label className="field">
              <span>名称</span>
              <input
                aria-label="提示词名称"
                onChange={(event) => onUpdateAiRoleName(event.target.value)}
                placeholder="例如：日报总结"
                value={draftRoleName}
              />
            </label>
            <label className="field settings-ai-grid__role">
              <span>提示词</span>
              <textarea
                aria-label="提示词"
                onChange={(event) => onUpdateAiRole(event.target.value)}
                placeholder="描述这个角色的输出方式、边界和语气。"
                rows={8}
                value={draft.aiRole}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
