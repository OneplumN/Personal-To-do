import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { App } from "../app/App";
import { resetDatabase } from "../lib/storage/db";
import { useFocusStore } from "../features/focus/focusStore";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { renderWithRouter } from "./test-utils";

describe("preferences store", () => {
  beforeEach(async () => {
    await resetDatabase();
    usePreferenceStore.setState({
      isLoaded: false,
      preferences: usePreferenceStore.getState().preferences,
    });
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
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

  test("opens settings as a drawer and supports close interactions", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "Open settings" }));
    expect(await screen.findByRole("dialog", { name: "设置" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "关闭设置" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "设置" })).not.toBeInTheDocument();
  });
});
