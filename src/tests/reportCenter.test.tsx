import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { App } from "../app/App";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { resetDatabase } from "../lib/storage/db";
import { DEFAULT_PREFERENCES } from "../lib/constants";
import { preferenceRepository } from "../lib/storage/preferenceRepository";
import { projectRepository } from "../lib/storage/projectRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { useFocusStore } from "../features/focus/focusStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { createProject } from "../types/project";
import { completeTask, createTask } from "../types/task";
import type { AiProfile } from "../types/preferences";
import { renderWithRouter } from "./test-utils";

describe("Report Center", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
    usePreferenceStore.setState({ isLoaded: false, preferences: DEFAULT_PREFERENCES });
  });

  test("generates reports from completed tasks only and saves editable records", async () => {
    const now = Date.now();
    const createdAt = new Date(now - 60 * 60 * 1000).toISOString();
    const completedAt = new Date(now - 30 * 60 * 1000).toISOString();
    const project = createProject({ name: "Project Delta" }, createdAt);
    const completed = completeTask(
      {
        ...createTask(
          {
            body: "正文优先展示，不展开 checklist 明细。",
            projectId: project.id,
            title: "完成日报结构",
          },
          createdAt,
        ),
        checklist: [{ done: false, id: "check-hidden", text: "不应该展示的 checklist" }],
      },
      {
        keyChanges: "增加概览区",
        notes: "后续补月报模板",
        summary: "日报结构完成",
      },
      completedAt,
    );
    const inProgress = {
      ...createTask(
        { projectId: project.id, title: "进行中的任务" },
        createdAt,
      ),
      status: "in_progress" as const,
    };

    await projectRepository.save(project);
    await taskRepository.save(completed);
    await taskRepository.save(inProgress);

    const user = userEvent.setup();
    renderWithRouter(<App />, { route: "/reports" });

    await screen.findByRole("heading", { level: 2, name: "报告中心" });
    expect(screen.getByText("正文优先展示，不展开 checklist 明细。")).toBeInTheDocument();
    expect(screen.queryByText("不应该展示的 checklist")).not.toBeInTheDocument();
    expect(screen.queryByText("Project Delta")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑" }));
    expect(screen.getByRole("dialog", { name: "任务详情" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "关闭任务详情" }));

    await user.click(screen.getByRole("button", { name: "Generate AI Report" }));
    expect(screen.getByRole("dialog", { name: "生成报告" })).toBeInTheDocument();
    expect(screen.getByText("模型")).toBeInTheDocument();
    expect(screen.getAllByText("API 1").length).toBeGreaterThan(0);
    expect(screen.queryByLabelText("Edit report date")).not.toBeInTheDocument();
    expect(screen.getByLabelText("角色")).toBeDisabled();
    expect(screen.queryByText(/tasklist and completion fields/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "生成" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "生成报告" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "重新生成" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Regenerate" })).toBeInTheDocument();
      expect(
        screen.getByLabelText("Polished Content API 1").textContent,
      ).toMatch(/完成日报结构/);
    });

    expect(useReportStore.getState().reports).toHaveLength(0);
    const polishedPreview = screen.getByLabelText("Polished Content API 1");
    expect(polishedPreview.textContent).toMatch(/Project Delta/);
    expect(polishedPreview.textContent).toMatch(
      /不应该展示的 checklist/,
    );
    expect(screen.getByText("正文优先展示，不展开 checklist 明细。")).toBeInTheDocument();
    expect(screen.queryByDisplayValue(/进行中的任务/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit output API 1" }));
    const polishedContent = screen.getByLabelText("Polished Content API 1") as HTMLTextAreaElement;
    await user.clear(polishedContent);
    await user.type(polishedContent, "报告正文手动修改");
    await user.click(screen.getByRole("button", { name: "Use this" }));

    await waitFor(() => {
      expect(useReportStore.getState().reports[0]?.polishedContent).toBe("报告正文手动修改");
    });
  });

  test("limits report comparison to two different API profiles", async () => {
    const profileTwo: AiProfile = {
      apiKey: "",
      endpoint: "",
      extraBodyJson: "",
      id: "ai-profile-two",
      model: "model-two",
      models: ["model-two"],
      name: "API 2",
      preset: "custom",
    };
    const profileThree: AiProfile = {
      apiKey: "",
      endpoint: "",
      extraBodyJson: "",
      id: "ai-profile-three",
      model: "model-three",
      models: ["model-three"],
      name: "API 3",
      preset: "custom",
    };
    usePreferenceStore.setState({
      isLoaded: false,
      preferences: {
        ...DEFAULT_PREFERENCES,
        aiProfiles: [...DEFAULT_PREFERENCES.aiProfiles, profileTwo, profileThree],
      },
    });
    await preferenceRepository.save({
      ...DEFAULT_PREFERENCES,
      aiProfiles: [...DEFAULT_PREFERENCES.aiProfiles, profileTwo, profileThree],
    });

    const user = userEvent.setup();
    renderWithRouter(<App />, { route: "/reports" });

    await screen.findByRole("heading", { level: 2, name: "报告中心" });
    await user.click(screen.getByRole("button", { name: "Generate AI Report" }));
    expect(screen.getAllByText("API 1").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Add API")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Add API"), profileTwo.id);

    expect(screen.getByText("已选 2/2")).toBeInTheDocument();
    expect(screen.getAllByText("API 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("API 2").length).toBeGreaterThan(0);
    expect(screen.queryByLabelText("Add API")).not.toBeInTheDocument();
  });
});
