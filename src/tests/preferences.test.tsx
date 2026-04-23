import { beforeEach, describe, expect, test } from "vitest";
import { resetDatabase } from "../lib/storage/db";
import { usePreferenceStore } from "../features/preferences/preferenceStore";

describe("preferences store", () => {
  beforeEach(async () => {
    await resetDatabase();
    usePreferenceStore.setState({
      isLoaded: false,
      preferences: usePreferenceStore.getState().preferences,
    });
  });

  test("loads defaults and persists theme and ai settings", async () => {
    const loaded = await usePreferenceStore.getState().loadPreferences();
    expect(loaded.theme).toBe("light");

    const saved = await usePreferenceStore.getState().savePreferences({
      aiEndpoint: "https://api.example.com",
      aiRole: "请输出日报",
      theme: "dark",
    });

    expect(saved.theme).toBe("dark");
    expect(saved.aiEndpoint).toBe("https://api.example.com");
    expect(saved.aiRole).toBe("请输出日报");
  });
});
