import type { Preferences } from "../../types/preferences";

export type PendingAiProfile = {
  id: string;
  previousActiveId: string;
};

export type PendingAiRoleTemplate = {
  id: string;
  previousActiveId: string;
  previousAiRole: string;
  previousRoleName: string;
};

export type ConfirmingDelete =
  | { id: string; type: "aiProfile" }
  | { id: string; type: "aiRoleTemplate" };

export type SavePreferences = (
  update: Partial<
    Pick<
      Preferences,
      | "activeAiProfileId"
      | "activeAiRoleTemplateId"
      | "aiEndpoint"
      | "aiKey"
      | "aiProfiles"
      | "aiRole"
      | "aiRolePresets"
      | "aiRoleTemplates"
      | "laneColors"
      | "todayStepDocked"
      | "todayStepHandlePosition"
      | "todayStepPinned"
      | "theme"
    >
  >,
) => Promise<Preferences>;
