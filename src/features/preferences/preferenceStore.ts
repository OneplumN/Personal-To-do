import { create } from "zustand";
import { DEFAULT_PREFERENCES } from "../../lib/constants";
import { preferenceRepository } from "../../lib/storage/preferenceRepository";
import type { Preferences } from "../../types/preferences";

type PreferenceState = {
  isLoaded: boolean;
  loadPreferences: () => Promise<Preferences>;
  preferences: Preferences;
  savePreferences: (
    update: Partial<
      Pick<Preferences, "aiEndpoint" | "aiKey" | "aiRole" | "laneColors" | "theme">
    >,
  ) => Promise<Preferences>;
};

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  isLoaded: false,
  async loadPreferences() {
    const preferences = await preferenceRepository.load();
    set({ isLoaded: true, preferences });
    return preferences;
  },
  preferences: DEFAULT_PREFERENCES,
  async savePreferences(update) {
    const nextPreferences: Preferences = {
      ...get().preferences,
      ...update,
      laneColors: {
        ...get().preferences.laneColors,
        ...update.laneColors,
      },
      updatedAt: new Date().toISOString(),
    };
    await preferenceRepository.save(nextPreferences);
    set({ preferences: nextPreferences });
    return nextPreferences;
  },
}));
