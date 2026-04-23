import { getDatabase } from "./db";
import { DEFAULT_PREFERENCES } from "../constants";
import type { Preferences } from "../../types/preferences";

export const preferenceRepository = {
  async load() {
    const db = await getDatabase();
    return (await db.get("preferences", DEFAULT_PREFERENCES.id)) ?? DEFAULT_PREFERENCES;
  },

  async save(preferences: Preferences) {
    const db = await getDatabase();
    await db.put("preferences", preferences);
    return preferences;
  },
};
