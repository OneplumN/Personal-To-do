import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { App } from "../app/App";
import { DEFAULT_PREFERENCES } from "../lib/constants";
import { resetDatabase } from "../lib/storage/db";
import { preferenceRepository } from "../lib/storage/preferenceRepository";
import { useFocusStore } from "../features/focus/focusStore";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { renderWithRouter } from "./test-utils";

describe("preferences store", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    await resetDatabase();
    usePreferenceStore.setState({
      isLoaded: false,
      preferences: DEFAULT_PREFERENCES,
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

  test("opens settings as a modal and supports close interactions", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    expect(await screen.findByRole("dialog", { name: "设置" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "主题" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("AI Provider")).not.toBeInTheDocument();
    expect(screen.getByLabelText("AI Service")).toBeInTheDocument();
    expect(screen.queryByLabelText("Request Preview")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Advanced JSON")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存设置" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "关闭设置" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "设置" })).not.toBeInTheDocument();
  });

  test("toggles theme from the app navigation", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "深色" }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(screen.getByRole("button", { name: "浅色" })).toBeInTheDocument();
    });
  });

  test("edits a lane color from settings", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    await screen.findByRole("dialog", { name: "设置" });
    expect(screen.getByRole("button", { name: "保存设置" })).toBeDisabled();
    await user.clear(await screen.findByLabelText("Doing color"));
    await user.type(screen.getByLabelText("Doing color"), "#123456");
    expect(screen.getByRole("button", { name: "保存设置" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      expect(usePreferenceStore.getState().preferences.laneColors.doing).toBe("#123456");
    });
  });

  test("saves and switches user AI roles from settings", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    expect(screen.queryByRole("button", { name: "极简执行" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add role" }));
    await user.clear(await screen.findByLabelText("AI Role Name"));
    await user.type(screen.getByLabelText("AI Role Name"), "写日报");
    await user.type(screen.getByLabelText("AI Role"), "写日报");
    expect(screen.getByRole("button", { name: "保存设置" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "创建 Role" }));
    await waitFor(() => {
      expect(screen.getByText("Role 已创建并保存。")).toBeInTheDocument();
      expect(usePreferenceStore.getState().preferences.aiRolePresets[0]?.label).toBe(
        "写日报",
      );
    });

    await user.click(screen.getByRole("button", { name: "Add role" }));
    await user.clear(screen.getByLabelText("AI Role Name"));
    await user.type(screen.getByLabelText("AI Role Name"), "拆任务");
    await user.type(screen.getByLabelText("AI Role"), "拆任务");
    await user.click(screen.getByRole("button", { name: "创建 Role" }));

    await user.click(screen.getByRole("button", { name: "写日报" }));
    await waitFor(() => {
      expect(screen.getByLabelText("AI Role")).toHaveValue("写日报");
    });
    await user.click(screen.getByRole("button", { name: "拆任务" }));
    await waitFor(() => {
      expect(screen.getByLabelText("AI Role")).toHaveValue("拆任务");
    });

    await waitFor(() => {
      expect(usePreferenceStore.getState().preferences.aiRolePresets).toHaveLength(2);
    });
    expect(screen.getByRole("button", { name: "保存设置" })).toBeDisabled();
  });

  test("saves custom AI role presets from settings", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    await user.selectOptions(await screen.findByLabelText("AI Service"), "deepseek");
    expect(screen.getByLabelText("AI Endpoint")).toHaveValue("https://api.deepseek.com");
    expect(screen.queryByRole("button", { name: "deepseek-chat" })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("AI Model"), "deepseek-chat");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("button", { name: "deepseek-chat" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.clear(screen.getByLabelText("AI Endpoint"));
    await user.type(await screen.findByLabelText("AI Endpoint"), "https://draft.example.com");
    expect(screen.getByRole("button", { name: "保存设置" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Add role" }));
    await user.clear(await screen.findByLabelText("AI Role Name"));
    await user.type(screen.getByLabelText("AI Role Name"), "写周报");
    await user.type(screen.getByLabelText("AI Role"), "写周报");
    await user.click(screen.getByRole("button", { name: "创建 Role" }));
    await waitFor(() => {
      expect(screen.getByText("Role 已创建并保存。")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存设置" })).toBeEnabled();
    });
    await user.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      expect(usePreferenceStore.getState().preferences.aiRolePresets[0]?.prompt).toBe(
        "写周报",
      );
    });
    expect(screen.getByRole("button", { name: "写周报" })).toBeInTheDocument();
    expect(screen.getByLabelText("AI Endpoint")).toHaveValue("https://draft.example.com");

    await user.click(screen.getByRole("button", { name: "Delete role 写周报" }));

    await waitFor(() => {
      expect(usePreferenceStore.getState().preferences.aiRolePresets).toHaveLength(0);
    });
  });

  test("cancels pending AI model and role additions from settings", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));

    await user.click(screen.getByRole("button", { name: "Add API" }));
    await user.clear(await screen.findByLabelText("AI Profile Name"));
    await user.type(screen.getByLabelText("AI Profile Name"), "Temporary API");
    await user.click(screen.getByRole("button", { name: "Cancel API" }));
    expect(screen.queryByRole("button", { name: "Temporary API" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add role" }));
    await user.clear(await screen.findByLabelText("AI Role Name"));
    await user.type(screen.getByLabelText("AI Role Name"), "Temporary Role");
    await user.click(screen.getByRole("button", { name: "Cancel role" }));
    expect(screen.queryByRole("button", { name: "Temporary Role" })).not.toBeInTheDocument();
  });

  test("switches AI API profiles with separate keys", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    await user.type(await screen.findByLabelText("AI Key"), "default-key");
    await user.click(screen.getByRole("button", { name: "Add API" }));
    await user.clear(screen.getByLabelText("AI Profile Name"));
    await user.type(screen.getByLabelText("AI Profile Name"), "Backup");
    await user.type(screen.getByLabelText("AI Model"), "backup-model");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.type(screen.getByLabelText("AI Endpoint"), "https://backup.example.com/v1");
    await user.type(screen.getByLabelText("AI Key"), "backup-key");
    await user.click(screen.getByRole("button", { name: "创建 API" }));

    await waitFor(() => {
      expect(usePreferenceStore.getState().preferences.aiProfiles).toHaveLength(2);
    });
    const persistedAfterConfirm = await preferenceRepository.load();
    const persistedBackup = persistedAfterConfirm.aiProfiles.find(
      (profile) => profile.name === "Backup",
    );
    expect(persistedBackup?.endpoint).toBe("https://backup.example.com/v1");
    expect(persistedBackup?.apiKey).toBe("backup-key");
    expect(persistedAfterConfirm.activeAiProfileId).toBe(persistedBackup?.id);

    await user.click(screen.getByRole("button", { name: "API 1" }));
    expect(screen.getByLabelText("AI Key")).toHaveValue("default-key");

    await user.click(screen.getByRole("button", { name: "Backup" }));
    expect(screen.getByLabelText("AI Key")).toHaveValue("backup-key");
    expect(screen.getByLabelText("AI Endpoint")).toHaveValue(
      "https://backup.example.com/v1",
    );
    expect(screen.getByRole("button", { name: "backup-model" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByLabelText("Advanced JSON")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Request Preview")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      const preferences = usePreferenceStore.getState().preferences;
      expect(preferences.aiProfiles).toHaveLength(2);
      expect(preferences.aiKey).toBe("backup-key");
      expect("provider" in preferences.aiProfiles[0]).toBe(false);
      expect(preferences.aiProfiles[1]?.model).toBe("backup-model");
      expect(preferences.aiProfiles[1]?.models).toContain("backup-model");
      expect(preferences.aiProfiles[1]?.apiKey).toBe("backup-key");
    });
  });

  test("hides the AI key by default and can reveal it", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));

    expect(await screen.findByLabelText("AI Key")).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "显示 AI Key" }));
    expect(screen.getByLabelText("AI Key")).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "隐藏 AI Key" }));
    expect(screen.getByLabelText("AI Key")).toHaveAttribute("type", "password");
  });

  test("tests an AI API profile from settings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: "OK" } }],
      }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    await user.selectOptions(await screen.findByLabelText("AI Service"), "deepseek");
    await user.type(screen.getByLabelText("AI Model"), "deepseek-chat");
    await user.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => {
      expect(screen.getByText(/200 OK/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "deepseek-chat" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/chat-completions",
      expect.any(Object),
    );
  });

  test("fetches models and lets the user add one from settings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        data: [{ id: "moonshot-v1-8k" }, { id: "moonshot-v1-32k" }],
      }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.click(screen.getByRole("button", { name: "设置" }));
    await user.selectOptions(await screen.findByLabelText("AI Service"), "kimi");
    await user.click(screen.getByRole("button", { name: "Fetch" }));
    await user.click(
      await screen.findByRole("button", { name: "Add fetched model moonshot-v1-8k" }),
    );

    expect(screen.getByRole("button", { name: "moonshot-v1-8k" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/models",
      expect.any(Object),
    );
  });

  test("applies the stored dark theme to the document color scheme", async () => {
    await preferenceRepository.save({
      ...DEFAULT_PREFERENCES,
      theme: "dark",
      updatedAt: "2026-04-24T10:15:00.000Z",
    });

    renderWithRouter(<App />);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });
});
