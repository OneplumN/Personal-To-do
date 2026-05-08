import { useState, type Dispatch, type SetStateAction } from "react";
import type { AiRoleTemplate, Preferences } from "../../types/preferences";
import type {
  ConfirmingDelete,
  PendingAiRoleTemplate,
  SavePreferences,
} from "./settingsTypes";

type UseAiRoleSettingsOptions = {
  confirmingDelete: ConfirmingDelete | null;
  draft: Preferences;
  savePreferences: SavePreferences;
  setConfirmingDelete: Dispatch<SetStateAction<ConfirmingDelete | null>>;
  setDraft: Dispatch<SetStateAction<Preferences>>;
  showToast: (toast: { message: string }) => void;
};

export function getInitialRoleName(preferences: {
  activeAiRoleTemplateId: string;
  aiRoleTemplates: AiRoleTemplate[];
}) {
  return (
    preferences.aiRoleTemplates.find(
      (template) => template.id === preferences.activeAiRoleTemplateId,
    )?.name ?? "自定义"
  );
}

function getNextRoleName(templates: AiRoleTemplate[]) {
  const usedNames = new Set(
    templates.filter((template) => !template.builtIn).map((template) => template.name.trim()),
  );
  let index = usedNames.size + 1;
  while (usedNames.has(`角色 ${index}`)) {
    index += 1;
  }
  return `角色 ${index}`;
}

export function useAiRoleSettings({
  confirmingDelete,
  draft,
  savePreferences,
  setConfirmingDelete,
  setDraft,
  showToast,
}: UseAiRoleSettingsOptions) {
  const [draftRoleName, setDraftRoleName] = useState(getInitialRoleName(draft));
  const [pendingAiRoleTemplate, setPendingAiRoleTemplate] =
    useState<PendingAiRoleTemplate | null>(null);
  const activeAiRoleTemplate = draft.aiRoleTemplates.find(
    (template) => template.id === draft.activeAiRoleTemplateId,
  );

  function syncRoleName(preferences: {
    activeAiRoleTemplateId: string;
    aiRoleTemplates: AiRoleTemplate[];
  }) {
    setDraftRoleName(getInitialRoleName(preferences));
  }

  async function handleSelectAiRoleTemplate(templateId: string) {
    if (pendingAiRoleTemplate && templateId !== pendingAiRoleTemplate.id) {
      return;
    }

    const selectedTemplate = draft.aiRoleTemplates.find(
      (candidate) => candidate.id === templateId,
    );
    if (!selectedTemplate) {
      return;
    }

    const savedPreferences = await savePreferences({
      activeAiRoleTemplateId: selectedTemplate.id,
      aiRole: selectedTemplate.prompt,
    });
    setDraft((current) => ({
      ...current,
      activeAiRoleTemplateId: savedPreferences.activeAiRoleTemplateId,
      aiRole: savedPreferences.aiRole,
    }));
    setDraftRoleName(selectedTemplate.name);
    setConfirmingDelete(null);
    showToast({ message: "角色已切换并保存。" });
  }

  function handleUpdateAiRole(prompt: string) {
    setDraft((current) => {
      if (!current.activeAiRoleTemplateId) {
        return {
          ...current,
          aiRole: prompt,
        };
      }

      return {
        ...current,
        aiRole: prompt,
        aiRoleTemplates: current.aiRoleTemplates.map((template) =>
          template.id === current.activeAiRoleTemplateId && !template.builtIn
            ? { ...template, prompt }
            : template,
        ),
      };
    });
  }

  function handleUpdateAiRoleName(name: string) {
    setDraftRoleName(name);
    setDraft((current) => {
      if (!current.activeAiRoleTemplateId) {
        return current;
      }

      return {
        ...current,
        aiRoleTemplates: current.aiRoleTemplates.map((template) =>
          template.id === current.activeAiRoleTemplateId && !template.builtIn
            ? { ...template, name }
            : template,
        ),
      };
    });
  }

  function handleAddAiRoleTemplate() {
    if (pendingAiRoleTemplate) {
      return;
    }

    const roleName = getNextRoleName(draft.aiRoleTemplates);
    const nextTemplate: AiRoleTemplate = {
      builtIn: false,
      id: crypto.randomUUID(),
      name: roleName,
      prompt: "",
    };
    setDraft((current) => ({
      ...current,
      activeAiRoleTemplateId: nextTemplate.id,
      aiRole: nextTemplate.prompt,
      aiRoleTemplates: [...current.aiRoleTemplates, nextTemplate],
    }));
    setPendingAiRoleTemplate({
      id: nextTemplate.id,
      previousActiveId: draft.activeAiRoleTemplateId,
      previousAiRole: draft.aiRole,
      previousRoleName: draftRoleName,
    });
    setDraftRoleName(nextTemplate.name);
  }

  async function handleConfirmAiRoleTemplate() {
    if (!pendingAiRoleTemplate) {
      return;
    }

    const finalName =
      draftRoleName.trim() ||
      getNextRoleName(
        draft.aiRoleTemplates.filter((template) => template.id !== pendingAiRoleTemplate.id),
      );
    const nextTemplates = draft.aiRoleTemplates.map((template) =>
      template.id === pendingAiRoleTemplate.id ? { ...template, name: finalName } : template,
    );
    const savedPreferences = await savePreferences({
      activeAiRoleTemplateId: pendingAiRoleTemplate.id,
      aiRole: draft.aiRole,
      aiRoleTemplates: nextTemplates,
    });
    setDraft((current) => ({
      ...current,
      activeAiRoleTemplateId: savedPreferences.activeAiRoleTemplateId,
      aiRole: savedPreferences.aiRole,
      aiRolePresets: savedPreferences.aiRolePresets,
      aiRoleTemplates: savedPreferences.aiRoleTemplates,
    }));
    setDraftRoleName(finalName);
    setPendingAiRoleTemplate(null);
    showToast({ message: "角色已创建并保存。" });
  }

  function handleCancelAiRoleTemplate() {
    if (!pendingAiRoleTemplate) {
      return;
    }

    setDraft((current) => {
      const templates = current.aiRoleTemplates.filter(
        (template) => template.id !== pendingAiRoleTemplate.id,
      );
      const nextActiveTemplate = templates.find(
        (template) => template.id === pendingAiRoleTemplate.previousActiveId,
      );
      return {
        ...current,
        activeAiRoleTemplateId: nextActiveTemplate?.id ?? "",
        aiRole: nextActiveTemplate?.prompt ?? pendingAiRoleTemplate.previousAiRole,
        aiRoleTemplates: templates,
      };
    });
    setDraftRoleName(pendingAiRoleTemplate.previousRoleName);
    setPendingAiRoleTemplate(null);
  }

  async function handleDeleteAiRoleTemplate(templateId: string) {
    if (pendingAiRoleTemplate) {
      return;
    }

    const template = draft.aiRoleTemplates.find((candidate) => candidate.id === templateId);
    if (!template || template.builtIn) {
      return;
    }

    const nextTemplates = draft.aiRoleTemplates.filter(
      (candidate) => candidate.id !== templateId,
    );
    const nextActiveAiRoleTemplateId =
      draft.activeAiRoleTemplateId === templateId ? "" : draft.activeAiRoleTemplateId;
    const savedPreferences = await savePreferences({
      activeAiRoleTemplateId: nextActiveAiRoleTemplateId,
      aiRole: nextActiveAiRoleTemplateId
        ? (nextTemplates.find((template) => template.id === nextActiveAiRoleTemplateId)
            ?.prompt ?? draft.aiRole)
        : "",
      aiRoleTemplates: nextTemplates,
    });
    setDraft((current) => ({
      ...current,
      activeAiRoleTemplateId: savedPreferences.activeAiRoleTemplateId,
      aiRole: savedPreferences.aiRole,
      aiRolePresets: savedPreferences.aiRolePresets,
      aiRoleTemplates: savedPreferences.aiRoleTemplates,
    }));
    setDraftRoleName(getInitialRoleName(savedPreferences));
    setConfirmingDelete(null);
    showToast({ message: "角色已删除。" });
  }

  function handleRequestDeleteAiRoleTemplate(templateId: string) {
    if (
      confirmingDelete?.type === "aiRoleTemplate" &&
      confirmingDelete.id === templateId
    ) {
      void handleDeleteAiRoleTemplate(templateId);
      return;
    }

    setConfirmingDelete({ id: templateId, type: "aiRoleTemplate" });
  }

  return {
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
  };
}
