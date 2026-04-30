import { getDatabase } from "./db";
import {
  AI_PROVIDER_PRESETS,
  DEFAULT_AI_PROFILES,
  DEFAULT_AI_ROLE_TEMPLATES,
  DEFAULT_PREFERENCES,
} from "../constants";
import type { AiProfile, AiRoleTemplate, Preferences } from "../../types/preferences";

function normalizeAiProfile(profile: Partial<AiProfile>): AiProfile | null {
  if (
    !profile ||
    typeof profile.id !== "string" ||
    typeof profile.name !== "string" ||
    typeof profile.endpoint !== "string" ||
    typeof profile.apiKey !== "string"
  ) {
    return null;
  }

  const preset =
    typeof profile.preset === "string" && profile.preset in AI_PROVIDER_PRESETS
      ? profile.preset
      : "custom";

  return {
    apiKey: profile.apiKey,
    endpoint: profile.endpoint,
    extraBodyJson:
      typeof profile.extraBodyJson === "string" ? profile.extraBodyJson : "",
    id: profile.id,
    model: typeof profile.model === "string" ? profile.model : "",
    models: normalizeAiModels(profile.models, profile.model),
    name: profile.name,
    preset,
  };
}

function normalizeAiModels(models: unknown, activeModel: unknown) {
  const savedModels = Array.isArray(models)
    ? models.filter((model): model is string => typeof model === "string")
    : [];
  const activeModelValue = typeof activeModel === "string" ? activeModel.trim() : "";
  const uniqueModels = [...savedModels, activeModelValue]
    .map((model) => model.trim())
    .filter(Boolean)
    .filter((model, index, allModels) => allModels.indexOf(model) === index);

  return uniqueModels;
}

function normalizePreferences(preferences?: Partial<Preferences>): Preferences {
  const legacyProfile: AiProfile = {
    ...DEFAULT_AI_PROFILES[0],
    apiKey: preferences?.aiKey ?? "",
    endpoint: preferences?.aiEndpoint ?? "",
  };
  const savedProfiles = Array.isArray(preferences?.aiProfiles)
    ? preferences.aiProfiles
        .map((profile) => normalizeAiProfile(profile))
        .filter((profile): profile is AiProfile => Boolean(profile))
    : [];
  const aiProfiles =
    savedProfiles.length > 0 ? savedProfiles : [legacyProfile];
  const safeAiProfiles = aiProfiles.length > 0 ? aiProfiles : [legacyProfile];
  const requestedAiProfileId = preferences?.activeAiProfileId;
  const activeAiProfileId =
    requestedAiProfileId &&
    safeAiProfiles.some((profile) => profile.id === requestedAiProfileId)
      ? requestedAiProfileId
      : safeAiProfiles[0].id;
  const activeAiProfile =
    safeAiProfiles.find((profile) => profile.id === activeAiProfileId) ?? safeAiProfiles[0];

  const savedTemplates =
    Array.isArray(preferences?.aiRoleTemplates) && preferences.aiRoleTemplates.length > 0
      ? preferences.aiRoleTemplates.filter(
          (template): template is AiRoleTemplate =>
            template &&
            typeof template.id === "string" &&
            typeof template.name === "string" &&
            typeof template.prompt === "string" &&
            typeof template.builtIn === "boolean",
        )
      : [];
  const legacyTemplates = Array.isArray(preferences?.aiRolePresets)
    ? preferences.aiRolePresets
        .filter(
          (preset) =>
            preset &&
            typeof preset.id === "string" &&
            typeof preset.label === "string" &&
            typeof preset.prompt === "string",
        )
        .map((preset): AiRoleTemplate => ({
          builtIn: false,
          id: preset.id,
          name: preset.label,
          prompt: preset.prompt,
        }))
    : [];
  const customTemplates = [...savedTemplates, ...legacyTemplates].filter(
    (template) => !template.builtIn,
  );
  const uniqueCustomTemplates = customTemplates.filter(
    (template, index, templates) =>
      templates.findIndex((candidate) => candidate.id === template.id) === index,
  );
  const aiRoleTemplates = [...DEFAULT_AI_ROLE_TEMPLATES, ...uniqueCustomTemplates];
  const requestedAiRoleTemplateId = preferences?.activeAiRoleTemplateId;
  const activeAiRoleTemplateId =
    requestedAiRoleTemplateId &&
    aiRoleTemplates.some((template) => template.id === requestedAiRoleTemplateId)
      ? requestedAiRoleTemplateId
      : "";

  return {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    activeAiProfileId,
    activeAiRoleTemplateId,
    aiEndpoint: activeAiProfile.endpoint,
    aiKey: activeAiProfile.apiKey,
    aiProfiles: safeAiProfiles,
    aiRolePresets: uniqueCustomTemplates.map((template) => ({
      id: template.id,
      label: template.name,
      prompt: template.prompt,
    })),
    aiRoleTemplates,
    laneColors: {
      ...DEFAULT_PREFERENCES.laneColors,
      ...preferences?.laneColors,
    },
  };
}

export const preferenceRepository = {
  async load() {
    const db = await getDatabase();
    return normalizePreferences(await db.get("preferences", DEFAULT_PREFERENCES.id));
  },

  async save(preferences: Preferences) {
    const db = await getDatabase();
    const normalizedPreferences = normalizePreferences(preferences);
    await db.put("preferences", normalizedPreferences);
    return normalizedPreferences;
  },
};
