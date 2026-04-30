import { useEffect, useMemo, useRef, useState } from "react";
import { exportSnapshot } from "../../lib/export/exportSnapshot";
import { importSnapshot } from "../../lib/import/importSnapshot";
import { persistLocalSnapshotNow } from "../../lib/localPersistence/localSnapshotApi";
import { useToast } from "../../components/common/ToastProvider";
import { AI_PROVIDER_PRESETS } from "../../lib/constants";
import {
  fetchAvailableModels,
  testChatCompletion,
  type ApiTestResult,
  type ModelListResult,
} from "../../lib/ai/llmClient";
import { useFocusStore } from "../focus/focusStore";
import { usePreferenceStore } from "../preferences/preferenceStore";
import { useProjectStore } from "../projects/projectStore";
import { useReportStore } from "../reports/reportStore";
import { useTaskStore } from "../tasks/taskStore";
import type { AiProfile, AiProviderPreset, AiRoleTemplate } from "../../types/preferences";

const LANE_COLOR_FIELDS = [
  { key: "task", label: "Task" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
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

const AI_PRESET_OPTIONS = [
  { label: "DeepSeek", value: "deepseek" },
  { label: "Kimi", value: "kimi" },
  { label: "智谱", value: "bigmodel" },
  { label: "Custom", value: "custom" },
] as const;

type PendingAiProfile = {
  id: string;
  previousActiveId: string;
};

type PendingAiRoleTemplate = {
  id: string;
  previousActiveId: string;
  previousAiRole: string;
  previousRoleName: string;
};

function getProfileSummary(profile: AiProfile) {
  return profile.model.trim() || profile.endpoint.trim() || "Not set";
}

function mergeAiModels(models: string[], nextModel: string) {
  const trimmedModel = nextModel.trim();
  if (!trimmedModel) {
    return models;
  }

  return [...models, trimmedModel].filter(
    (model, index, allModels) => allModels.indexOf(model) === index,
  );
}

function getInitialRoleName(preferences: { activeAiRoleTemplateId: string; aiRoleTemplates: AiRoleTemplate[] }) {
  return (
    preferences.aiRoleTemplates.find(
      (template) => template.id === preferences.activeAiRoleTemplateId,
    )?.name ?? "Custom"
  );
}

function getNextRoleName(templates: AiRoleTemplate[]) {
  const usedNames = new Set(
    templates.filter((template) => !template.builtIn).map((template) => template.name.trim()),
  );
  let index = usedNames.size + 1;
  while (usedNames.has(`Role ${index}`)) {
    index += 1;
  }
  return `Role ${index}`;
}

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

function SettingsCloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m7 7 10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="m17 7-10 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function SettingsAddIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function SettingsSaveIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12.5 4.5 4.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function SettingsEyeIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SettingsEyeOffIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m4.5 4.5 15 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.1 8.1C4.4 9.6 3.5 12 3.5 12s3.2 6 8.5 6c1.5 0 2.8-.5 4-1.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10 6.3c.6-.2 1.3-.3 2-.3 5.3 0 8.5 6 8.5 6s-.7 1.4-2 2.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.4 10.4a2.7 2.7 0 0 0 3.2 3.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SettingsExportIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 16V4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="m7 9 5-5 5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SettingsImportIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4v12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="m17 11-5 5-5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

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
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState(preferences);
  const [isAiKeyVisible, setIsAiKeyVisible] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<ApiTestResult | null>(null);
  const [modelListResult, setModelListResult] = useState<ModelListResult | null>(null);
  const [draftModelName, setDraftModelName] = useState("");
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [draftRoleName, setDraftRoleName] = useState(getInitialRoleName(preferences));
  const [pendingAiProfile, setPendingAiProfile] = useState<PendingAiProfile | null>(null);
  const [pendingAiRoleTemplate, setPendingAiRoleTemplate] =
    useState<PendingAiRoleTemplate | null>(null);

  const prettyExportName = useMemo(
    () => `personal-to-do-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
    [],
  );
  const activeAiProfile =
    draft.aiProfiles.find((profile) => profile.id === draft.activeAiProfileId) ??
    draft.aiProfiles[0] ??
    ({
      apiKey: "",
      endpoint: "",
      extraBodyJson: "",
      id: "",
      model: "",
      models: [],
      name: "API 1",
      preset: "custom",
    } satisfies AiProfile);
  const activeAiRoleTemplate = draft.aiRoleTemplates.find(
    (template) => template.id === draft.activeAiRoleTemplateId,
  );
  const fetchedAiModels =
    modelListResult?.ok
      ? modelListResult.models.filter(
          (model) => !activeAiProfile.models.includes(model),
        )
      : [];
  const hasPendingAiItem = Boolean(pendingAiProfile || pendingAiRoleTemplate);
  const hasUnsavedChanges = useMemo(
    () => getPreferenceDraftSnapshot(draft) !== getPreferenceDraftSnapshot(preferences),
    [draft, preferences],
  );
  const isGlobalSaveDisabled = hasPendingAiItem || !hasUnsavedChanges;
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
    setDraftRoleName(getInitialRoleName(savedPreferences));
    showToast({ message: "已保存" });
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
    showToast({ message: "已导出" });
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const snapshot = JSON.parse(text);
    await importSnapshot(snapshot);
    await Promise.all([loadProjects(), loadTasks(), loadFocus(), loadReports()]);
    await usePreferenceStore.getState().loadPreferences();
    const importedPreferences = usePreferenceStore.getState().preferences;
    setDraft(importedPreferences);
    setDraftRoleName(getInitialRoleName(importedPreferences));
    setPendingAiProfile(null);
    setPendingAiRoleTemplate(null);
    await persistLocalSnapshotNow();
    showToast({ message: "已导入" });
  }

  function updateLaneColor(key: keyof typeof draft.laneColors, value: string) {
    setDraft((current) => ({
      ...current,
      laneColors: { ...current.laneColors, [key]: value },
    }));
  }

  function handleSelectAiProfile(profileId: string) {
    if (pendingAiProfile && profileId !== pendingAiProfile.id) {
      return;
    }

    setDraft((current) => {
      const profile =
        current.aiProfiles.find((candidate) => candidate.id === profileId) ??
        current.aiProfiles[0];
      return {
        ...current,
        activeAiProfileId: profile.id,
        aiEndpoint: profile.endpoint,
        aiKey: profile.apiKey,
      };
    });
    setIsAiKeyVisible(false);
    setApiTestResult(null);
    setModelListResult(null);
    setDraftModelName("");
  }

  function handleUpdateActiveAiProfile(update: Partial<AiProfile>) {
    setDraft((current) => {
      const profiles = current.aiProfiles.map((profile) =>
        profile.id === current.activeAiProfileId ? { ...profile, ...update } : profile,
      );
      const activeProfile =
        profiles.find((profile) => profile.id === current.activeAiProfileId) ?? profiles[0];
      return {
        ...current,
        aiEndpoint: activeProfile.endpoint,
        aiKey: activeProfile.apiKey,
        aiProfiles: profiles,
      };
    });
    setApiTestResult(null);
  }

  function handleSelectAiProviderPreset(preset: AiProviderPreset) {
    const presetConfig = AI_PROVIDER_PRESETS[preset];
    handleUpdateActiveAiProfile({
      endpoint: presetConfig.endpoint,
      preset,
    });
    setModelListResult(null);
  }

  function handleSelectAiModel(model: string) {
    handleUpdateActiveAiProfile({
      model,
      models: mergeAiModels(activeAiProfile.models, model),
    });
  }

  function handleAddAiModel(model: string) {
    const trimmedModel = model.trim();
    if (!trimmedModel) {
      return;
    }

    handleSelectAiModel(trimmedModel);
    setDraftModelName("");
  }

  function handleDeleteAiModel(model: string) {
    const nextModels = activeAiProfile.models.filter((candidate) => candidate !== model);
    handleUpdateActiveAiProfile({
      model: activeAiProfile.model === model ? (nextModels[0] ?? "") : activeAiProfile.model,
      models: nextModels,
    });
  }

  async function handleFetchAiModels() {
    if (!activeAiProfile.endpoint.trim()) {
      setModelListResult({
        error: "Endpoint is required.",
        ok: false,
        status: 0,
      });
      return;
    }

    setIsFetchingModels(true);
    setModelListResult(null);
    const result = await fetchAvailableModels({
      apiKey: activeAiProfile.apiKey,
      endpoint: activeAiProfile.endpoint,
    });
    setModelListResult(result);
    setIsFetchingModels(false);
    if (result.ok) {
      showToast({ message: "模型已更新" });
    }
  }

  async function handleTestActiveApi() {
    const modelToTest = draftModelName.trim() || activeAiProfile.model.trim();

    if (!activeAiProfile.endpoint.trim() || !modelToTest) {
      setApiTestResult({
        elapsedMs: 0,
        error: "Endpoint and model are required. Type a model id or choose one from Models.",
        ok: false,
        status: 0,
      });
      return;
    }

    if (draftModelName.trim()) {
      handleSelectAiModel(draftModelName.trim());
      setDraftModelName("");
    }

    setIsTestingApi(true);
    setApiTestResult(null);
    const result = await testChatCompletion({
      apiKey: activeAiProfile.apiKey,
      endpoint: activeAiProfile.endpoint,
      extraBodyJson: activeAiProfile.extraBodyJson,
      model: modelToTest,
    });
    setApiTestResult(result);
    setIsTestingApi(false);
    if (result.ok) {
      showToast({ message: "API 可用" });
    }
  }

  function handleAddAiProfile() {
    if (pendingAiProfile) {
      return;
    }

    const nextProfile: AiProfile = {
      apiKey: "",
      endpoint: "",
      extraBodyJson: "",
      id: crypto.randomUUID(),
      model: "",
      models: [],
      name: `API ${draft.aiProfiles.length + 1}`,
      preset: "custom",
    };
    setDraft((current) => ({
      ...current,
      activeAiProfileId: nextProfile.id,
      aiEndpoint: "",
      aiKey: "",
      aiProfiles: [...current.aiProfiles, nextProfile],
    }));
    setPendingAiProfile({
      id: nextProfile.id,
      previousActiveId: draft.activeAiProfileId,
    });
    setIsAiKeyVisible(false);
    setModelListResult(null);
    setDraftModelName("");
  }

  async function handleConfirmAiProfile() {
    if (!pendingAiProfile) {
      return;
    }

    const nextProfiles = draft.aiProfiles.map((profile) =>
      profile.id === pendingAiProfile.id && !profile.name.trim()
        ? { ...profile, name: `API ${draft.aiProfiles.length}` }
        : profile,
    );
    const nextActiveProfile =
      nextProfiles.find((profile) => profile.id === pendingAiProfile.id) ?? nextProfiles[0];
    const savedPreferences = await savePreferences({
      activeAiProfileId: nextActiveProfile.id,
      aiEndpoint: nextActiveProfile.endpoint,
      aiKey: nextActiveProfile.apiKey,
      aiProfiles: nextProfiles,
    });
    setDraft((current) => ({
      ...current,
      activeAiProfileId: savedPreferences.activeAiProfileId,
      aiEndpoint: savedPreferences.aiEndpoint,
      aiKey: savedPreferences.aiKey,
      aiProfiles: savedPreferences.aiProfiles,
    }));
    setPendingAiProfile(null);
    showToast({ message: "API 已创建并保存。" });
  }

  function handleCancelAiProfile() {
    if (!pendingAiProfile) {
      return;
    }

    setDraft((current) => {
      const profiles = current.aiProfiles.filter((profile) => profile.id !== pendingAiProfile.id);
      const nextActiveProfile =
        profiles.find((profile) => profile.id === pendingAiProfile.previousActiveId) ??
        profiles[0];
      return {
        ...current,
        activeAiProfileId: nextActiveProfile.id,
        aiEndpoint: nextActiveProfile.endpoint,
        aiKey: nextActiveProfile.apiKey,
        aiProfiles: profiles,
      };
    });
    setPendingAiProfile(null);
    setIsAiKeyVisible(false);
    setApiTestResult(null);
  }

  function handleDeleteActiveAiProfile() {
    if (pendingAiProfile) {
      return;
    }

    if (draft.aiProfiles.length <= 1) {
      showToast({ message: "至少保留一个 API" });
      return;
    }

    setDraft((current) => {
      const profiles = current.aiProfiles.filter(
        (profile) => profile.id !== current.activeAiProfileId,
      );
      const nextActiveProfile = profiles[0];
      return {
        ...current,
        activeAiProfileId: nextActiveProfile.id,
        aiEndpoint: nextActiveProfile.endpoint,
        aiKey: nextActiveProfile.apiKey,
        aiProfiles: profiles,
      };
    });
    setIsAiKeyVisible(false);
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
    showToast({ message: "Role 已切换并保存。" });
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
    showToast({ message: "Role 已创建并保存。" });
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
    showToast({ message: "Role 已删除。" });
  }

  return (
    <div
      className="modal-backdrop settings-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-label="设置"
        aria-modal="true"
        className="settings-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="settings-modal__header">
          <div className="settings-header__title">
            <h3>Settings</h3>
          </div>
          <button
            aria-label="关闭设置"
            className="icon-button icon-action icon-action--danger settings-header__close"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <SettingsCloseIcon />
          </button>
        </header>
        <div className="settings-modal__body settings-dialog" ref={bodyRef}>
          <div className="settings-row-stack">
            <section className="settings-section" id="settings-colors">
              <div className="detail-section__header">
                <h4>APPEARANCE</h4>
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
                          aria-label={`${field.label} color`}
                          onChange={(event) => updateLaneColor(field.key, event.target.value)}
                          value={value}
                        />
                      </label>
                      <div
                        aria-label={`${field.label} color presets`}
                        className="settings-color-card__presets"
                      >
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            aria-label={`${field.label} use ${preset}`}
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

            <section className="settings-section" id="settings-ai">
              <div className="detail-section__header">
                <h4>AI</h4>
              </div>
              <div className="settings-ai-grid">
                <div className="settings-ai-block settings-ai-block--model">
                  <div className="settings-ai-block__header">
                    <div className="settings-ai-block__title">
                      <span>Models</span>
                      <strong>
                        {activeAiProfile.name} · {getProfileSummary(activeAiProfile)}
                      </strong>
                    </div>
                    <div className="settings-ai-card-actions">
                      {pendingAiProfile ? (
                        <>
                          <button
                            aria-label="创建 API"
                            className="settings-ai-card-action settings-ai-card-action--confirm"
                            onClick={() => {
                              void handleConfirmAiProfile();
                            }}
                            title="创建 API"
                            type="button"
                          >
                            <SettingsSaveIcon />
                          </button>
                          <button
                            aria-label="Cancel API"
                            className="settings-ai-card-action settings-ai-card-action--cancel"
                            onClick={handleCancelAiProfile}
                            title="Cancel API"
                            type="button"
                          >
                            <SettingsCloseIcon />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            aria-label="Add API"
                            className="settings-ai-card-action settings-ai-card-action--add"
                            onClick={handleAddAiProfile}
                            title="Add API"
                            type="button"
                          >
                            <SettingsAddIcon />
                          </button>
                          <button
                            aria-label={`Delete API ${activeAiProfile.name}`}
                            className="settings-ai-card-action"
                            disabled={draft.aiProfiles.length <= 1}
                            onClick={handleDeleteActiveAiProfile}
                            title="Delete API"
                            type="button"
                          >
                            <SettingsCloseIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="settings-ai-presets" aria-label="AI APIs">
                    {draft.aiProfiles.map((profile) => (
                      <button
                        aria-pressed={profile.id === draft.activeAiProfileId}
                        className={
                          profile.id === draft.activeAiProfileId
                            ? "settings-ai-preset settings-ai-preset--active"
                            : "settings-ai-preset"
                        }
                        disabled={Boolean(
                          pendingAiProfile && profile.id !== pendingAiProfile.id,
                        )}
                        key={profile.id}
                        onClick={() => handleSelectAiProfile(profile.id)}
                        type="button"
                      >
                        {profile.name}
                      </button>
                    ))}
                  </div>
                  <div className="settings-ai-fields settings-ai-fields--api">
                    <label className="field">
                      <span>Service</span>
                      <select
                        aria-label="AI Service"
                        onChange={(event) =>
                          handleSelectAiProviderPreset(
                            event.target.value as AiProviderPreset,
                          )
                        }
                        value={activeAiProfile.preset}
                      >
                        {AI_PRESET_OPTIONS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Name</span>
                      <input
                        aria-label="AI Profile Name"
                        onChange={(event) =>
                          handleUpdateActiveAiProfile({ name: event.target.value })
                        }
                        value={activeAiProfile.name}
                      />
                    </label>
                    <label className="field settings-ai-endpoint-field">
                      <span>Endpoint</span>
                      <input
                        aria-label="AI Endpoint"
                        onChange={(event) =>
                          handleUpdateActiveAiProfile({ endpoint: event.target.value })
                        }
                        placeholder="Minimax / Kimi / DeepSeek / ChatGPT endpoint"
                        value={activeAiProfile.endpoint}
                      />
                    </label>
                    <div className="field settings-ai-models-field">
                      <span>Models</span>
                      <div className="settings-ai-models-control">
                        <input
                          aria-label="AI Model"
                          onChange={(event) => setDraftModelName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleAddAiModel(draftModelName);
                            }
                          }}
                          placeholder="Paste model id"
                          value={draftModelName}
                        />
                        <button
                          className="settings-ai-test-button"
                          disabled={!draftModelName.trim()}
                          onClick={() => handleAddAiModel(draftModelName)}
                          type="button"
                        >
                          Add
                        </button>
                        <button
                          className="settings-ai-test-button"
                          disabled={isFetchingModels}
                          onClick={() => {
                            void handleFetchAiModels();
                          }}
                          type="button"
                        >
                          {isFetchingModels ? "Fetching..." : "Fetch"}
                        </button>
                      </div>
                      <div className="settings-ai-models-list" aria-label="AI Models">
                        {activeAiProfile.models.length > 0 ? (
                          activeAiProfile.models.map((model) => (
                            <span className="settings-ai-model-chip" key={model}>
                              <button
                                aria-pressed={model === activeAiProfile.model}
                                className={
                                  model === activeAiProfile.model
                                    ? "settings-ai-preset settings-ai-preset--active"
                                    : "settings-ai-preset"
                                }
                                onClick={() => handleSelectAiModel(model)}
                                type="button"
                              >
                                {model}
                              </button>
                              <button
                                aria-label={`Delete model ${model}`}
                                className="settings-ai-card-action"
                                onClick={() => handleDeleteAiModel(model)}
                                type="button"
                              >
                                <SettingsCloseIcon />
                              </button>
                            </span>
                          ))
                        ) : (
                          <p className="settings-ai-empty">No models yet</p>
                        )}
                      </div>
                      {modelListResult ? (
                        modelListResult.ok ? (
                          <div className="settings-ai-models-list" aria-label="Fetched models">
                            {fetchedAiModels.length > 0 ? (
                              fetchedAiModels.map((model) => (
                                <span className="settings-ai-model-chip" key={model}>
                                  <button
                                    className="settings-ai-preset"
                                    onClick={() => handleAddAiModel(model)}
                                    type="button"
                                  >
                                    {model}
                                  </button>
                                  <button
                                    aria-label={`Add fetched model ${model}`}
                                    className="settings-ai-card-action settings-ai-card-action--add"
                                    onClick={() => handleAddAiModel(model)}
                                    type="button"
                                  >
                                    <SettingsAddIcon />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <p className="settings-ai-empty">
                                No models returned. Add one manually.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="settings-ai-test-result settings-ai-test-result--error">
                            {`${modelListResult.status || "ERR"} · ${modelListResult.error}`}
                          </p>
                        )
                      ) : null}
                    </div>
                    <div className="field settings-secret-field">
                      <span>Key</span>
                      <div className="settings-secret-row">
                        <div className="settings-secret-input">
                          <input
                            aria-label="AI Key"
                            onChange={(event) =>
                              handleUpdateActiveAiProfile({ apiKey: event.target.value })
                            }
                            type={isAiKeyVisible ? "text" : "password"}
                            value={activeAiProfile.apiKey}
                          />
                          <button
                            aria-label={isAiKeyVisible ? "隐藏 AI Key" : "显示 AI Key"}
                            className="settings-secret-toggle"
                            onClick={() => setIsAiKeyVisible((current) => !current)}
                            type="button"
                          >
                            {isAiKeyVisible ? <SettingsEyeOffIcon /> : <SettingsEyeIcon />}
                          </button>
                        </div>
                        <button
                          className="settings-ai-test-button"
                          disabled={isTestingApi}
                          onClick={() => {
                            void handleTestActiveApi();
                          }}
                          type="button"
                        >
                          {isTestingApi ? "Checking..." : "Check"}
                        </button>
                      </div>
                    </div>
                    {apiTestResult ? (
                      <p
                        className={
                          apiTestResult.ok
                            ? "settings-ai-test-result settings-ai-test-result--ok"
                            : "settings-ai-test-result settings-ai-test-result--error"
                        }
                      >
                        {apiTestResult.ok
                          ? `${apiTestResult.status} OK · ${apiTestResult.elapsedMs}ms · ${apiTestResult.content}`
                          : `${apiTestResult.status || "ERR"} · ${apiTestResult.elapsedMs}ms · ${apiTestResult.error}`}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="settings-ai-block settings-ai-block--role">
                  <div className="settings-ai-block__header">
                    <div className="settings-ai-block__title">
                      <span>Roles</span>
                      <strong>{activeAiRoleTemplate?.name ?? "Custom"}</strong>
                    </div>
                    <div className="settings-ai-card-actions">
                      {pendingAiRoleTemplate ? (
                        <>
                          <button
                            aria-label="创建 Role"
                            className="settings-ai-card-action settings-ai-card-action--confirm"
                            onClick={() => {
                              void handleConfirmAiRoleTemplate();
                            }}
                            title="创建 Role"
                            type="button"
                          >
                            <SettingsSaveIcon />
                          </button>
                          <button
                            aria-label="Cancel role"
                            className="settings-ai-card-action settings-ai-card-action--cancel"
                            onClick={handleCancelAiRoleTemplate}
                            title="Cancel role"
                            type="button"
                          >
                            <SettingsCloseIcon />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            aria-label="Add role"
                            className="settings-ai-card-action settings-ai-card-action--add"
                            onClick={handleAddAiRoleTemplate}
                            title="Add role"
                            type="button"
                          >
                            <SettingsAddIcon />
                          </button>
                          {activeAiRoleTemplate && !activeAiRoleTemplate.builtIn ? (
                            <button
                              aria-label={`Delete role ${activeAiRoleTemplate.name}`}
                              className="settings-ai-card-action"
                              onClick={() =>
                                void handleDeleteAiRoleTemplate(activeAiRoleTemplate.id)
                              }
                              title="Delete role"
                              type="button"
                            >
                              <SettingsCloseIcon />
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="settings-ai-presets" aria-label="AI Roles">
                    {draft.aiRoleTemplates.filter((template) => !template.builtIn).length ===
                    0 ? (
                      <p className="settings-ai-empty">No roles yet</p>
                    ) : (
                      draft.aiRoleTemplates
                        .filter((template) => !template.builtIn)
                        .map((template) => (
                          <span className="settings-ai-custom-preset" key={template.id}>
                            <button
                              aria-pressed={template.id === draft.activeAiRoleTemplateId}
                              className={
                                template.id === draft.activeAiRoleTemplateId
                                  ? "settings-ai-preset settings-ai-preset--active"
                                  : "settings-ai-preset"
                              }
                              disabled={Boolean(
                                pendingAiRoleTemplate &&
                                  template.id !== pendingAiRoleTemplate.id,
                              )}
                              onClick={() => {
                                void handleSelectAiRoleTemplate(template.id);
                              }}
                              type="button"
                            >
                              {template.name}
                            </button>
                          </span>
                        ))
                    )}
                  </div>
                  <div className="settings-ai-fields settings-ai-fields--role">
                    <label className="field">
                      <span>Name</span>
                      <input
                        aria-label="AI Role Name"
                        onChange={(event) => handleUpdateAiRoleName(event.target.value)}
                        value={draftRoleName}
                      />
                    </label>
                    <label className="field settings-ai-grid__role">
                      <span>Prompt</span>
                      <textarea
                        aria-label="AI Role"
                        onChange={(event) => handleUpdateAiRole(event.target.value)}
                        rows={4}
                        value={draft.aiRole}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section className="settings-section" id="settings-data">
              <div className="detail-section__header">
                <h4>DATA</h4>
              </div>
              <div className="settings-actions">
                <button
                  className="settings-action-card"
                  onClick={() => void handleExport()}
                  type="button"
                >
                  <span className="settings-action-card__icon">
                    <SettingsExportIcon />
                  </span>
                  <span>
                    <strong>Export</strong>
                    <small>Snapshot</small>
                  </span>
                </button>
                <button
                  className="settings-action-card"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <span className="settings-action-card__icon">
                    <SettingsImportIcon />
                  </span>
                  <span>
                    <strong>Import</strong>
                    <small>JSON</small>
                  </span>
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
          </div>
        </div>

        <footer className="settings-modal__footer settings-footer">
          <button
            aria-label="关闭"
            className="icon-button icon-action icon-action--danger"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <SettingsCloseIcon />
          </button>
          <button
            aria-label="保存设置"
            className="icon-button icon-action icon-action--success"
            disabled={isGlobalSaveDisabled}
            onClick={() => void handleSave()}
            title={
              hasPendingAiItem
                ? "请先确认或取消正在编辑的 AI 项"
                : hasUnsavedChanges
                  ? "保存设置"
                  : "没有未保存的改动"
            }
            type="button"
          >
            <SettingsSaveIcon />
          </button>
        </footer>
      </section>
    </div>
  );
}
