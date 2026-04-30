import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { App } from "../app/App";
import { resetDatabase } from "../lib/storage/db";
import { projectRepository } from "../lib/storage/projectRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { useFocusStore } from "../features/focus/focusStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { createProject } from "../types/project";
import { completeTask, createTask } from "../types/task";
import { renderWithRouter } from "./test-utils";

describe("Project workspace", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
  });

  test("renders a single-screen list-first project workspace", async () => {
    const project = createProject(
      {
        description: "原始项目笔记",
        name: "Project Beta",
      },
      "2026-04-23T08:00:00.000Z",
    );
    const sideProject = createProject(
      {
        description: "第二项目笔记",
        name: "Project Delta",
      },
      "2026-04-23T08:03:00.000Z",
    );
    const todoTask = createTask(
      {
        body: "把任务台改成安静的列表，不再使用厚卡片。",
        projectId: project.id,
        title: "准备任务列表",
      },
      "2026-04-23T08:10:00.000Z",
    );
    const blockedTask = {
      ...createTask(
        {
          body: "需要等设计方向最终确认，再进入样式收敛。",
          projectId: project.id,
          title: "等待设计确认",
        },
        "2026-04-23T08:20:00.000Z",
      ),
      status: "blocked" as const,
    };
    const inProgressTask = {
      ...createTask(
        {
          body: "确认推进按钮和状态切换的密度是否足够克制。",
          projectId: project.id,
          title: "梳理交互状态",
        },
        "2026-04-23T08:25:00.000Z",
      ),
      status: "in_progress" as const,
    };
    const doneTask = completeTask(
      createTask(
        { projectId: project.id, title: "完成日报结构" },
        "2026-04-23T08:30:00.000Z",
      ),
      {
        keyChanges: "梳理完成列布局",
        notes: "下一步补充周报草稿",
        summary: "日报结构已可生成。",
      },
      "2026-04-23T09:00:00.000Z",
    );

    await projectRepository.save(project);
    await projectRepository.save(sideProject);
    await taskRepository.save(todoTask);
    await taskRepository.save(blockedTask);
    await taskRepository.save(inProgressTask);
    await taskRepository.save(doneTask);

    const user = userEvent.setup();
    const { container } = renderWithRouter(<App />, {
      route: `/projects?project=${project.id}`,
    });

    await screen.findByRole("navigation", { name: "项目" });
    expect(container.querySelector(".project-workspace--split-pane")).not.toBeNull();
    expect(container.querySelector(".project-workspace__task-shell")).not.toBeNull();
    expect(container.querySelector(".project-switcher")).toBeNull();
    expect(container.querySelector(".project-workspace__main .project-summary")).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑项目笔记" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "返回首页" })).toBeInTheDocument();
    const projectNav = screen.getByRole("navigation", { name: "项目" });
    const activeProjectCard = container.querySelector(".project-sidebar__item--active");
    expect(activeProjectCard).not.toBeNull();
    expect(activeProjectCard).toHaveTextContent("Project Beta");
    expect(activeProjectCard).toHaveTextContent("1/4");
    expect(activeProjectCard).not.toHaveTextContent("原始项目笔记");
    expect(screen.getByRole("button", { name: "新建任务" })).toBeInTheDocument();
    expect(within(projectNav).getByRole("button", { name: "Project Beta" })).toBeInTheDocument();
    await user.click(within(projectNav).getByRole("button", { name: "Project Delta" }));
    await waitFor(() => {
      const nextActiveProjectCard = container.querySelector(".project-sidebar__item--active");
      expect(nextActiveProjectCard).not.toBeNull();
      expect(nextActiveProjectCard).toHaveTextContent("Project Delta");
      expect(nextActiveProjectCard).toHaveTextContent("0/0");
      expect(nextActiveProjectCard).not.toHaveTextContent("第二项目笔记");
    });
    expect(screen.queryByText("准备任务列表")).not.toBeInTheDocument();
    await user.click(within(projectNav).getByRole("button", { name: "Project Beta" }));
    await waitFor(() => {
      const nextActiveProjectCard = container.querySelector(".project-sidebar__item--active");
      expect(nextActiveProjectCard).not.toBeNull();
      expect(nextActiveProjectCard).toHaveTextContent("Project Beta");
    });
    expect(screen.getByRole("heading", { level: 2, name: "TASK" })).toBeInTheDocument();
    expect(screen.queryByText("任务工作区")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "待做" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "进行中" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "已完成" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "当前推进" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "生成日报" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打开报告中心" })).not.toBeInTheDocument();
    expect(screen.queryByText("阻塞中")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".task-column__scroll")).toHaveLength(3);

    const todoColumn = screen.getByRole("heading", { level: 3, name: "待做" }).closest("section");
    expect(todoColumn).not.toBeNull();
    const todoRow = within(todoColumn as HTMLElement)
      .getByText("准备任务列表")
      .closest(".task-board-item");
    expect(todoRow).not.toBeNull();
    expect(
      within(todoRow as HTMLElement).getByText("把任务台改成安静的列表，不再使用厚卡片。"),
    ).toBeInTheDocument();
    expect(
      within(todoRow as HTMLElement).getByRole("button", {
        name: "加入",
      }),
    ).toBeInTheDocument();
    await user.click(
      within(todoRow as HTMLElement).getByRole("button", {
        name: "加入",
      }),
    );
    await waitFor(() => {
      expect(useFocusStore.getState().focusRefs[0]?.taskId).toBe(todoTask.id);
    });
    expect(
      within(todoRow as HTMLElement).getByRole("button", {
        name: "移出",
      }),
    ).toBeInTheDocument();
    expect(
      within(todoRow as HTMLElement).getByRole("button", {
        name: "编辑",
      }),
    ).toBeInTheDocument();
    expect(
      within(todoRow as HTMLElement).getByRole("button", { name: "修改优先级：普通" }),
    ).toBeInTheDocument();
    await user.click(
      within(todoRow as HTMLElement).getByRole("button", { name: "修改优先级：普通" }),
    );
    await user.click(within(todoRow as HTMLElement).getByRole("button", { name: "重要" }));

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "准备任务列表")?.priority,
      ).toBe("important");
    });
    await user.click(
      within(todoRow as HTMLElement).getByRole("button", {
        name: "推进",
      }),
    );

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "准备任务列表")?.status,
      ).toBe("in_progress");
    });

    await user.click(screen.getByRole("button", { name: "新建任务" }));
    expect(await screen.findByRole("dialog", { name: "新建任务" })).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "任务标题" }), "补充任务入口{Enter}");

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "补充任务入口")?.projectId,
      ).toBe(project.id);
    });
    expect(screen.getByText("补充任务入口")).toBeInTheDocument();

    const createdRow = within(todoColumn as HTMLElement)
      .getByText("补充任务入口")
      .closest(".task-board-item");
    expect(createdRow).not.toBeNull();
    await user.click(
      within(createdRow as HTMLElement).getByRole("button", {
        name: "加入",
      }),
    );
    await waitFor(() => {
      const createdTask = useTaskStore
        .getState()
        .tasks.find((task) => task.title === "补充任务入口");
      expect(useFocusStore.getState().focusRefs.some((ref) => ref.taskId === createdTask?.id)).toBe(
        true,
      );
    });
    await user.click(
      within(createdRow as HTMLElement).getByRole("button", {
        name: "编辑",
      }),
    );
    expect(await screen.findByRole("dialog", { name: "任务详情" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存并关闭" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "任务详情" })).not.toBeInTheDocument();
      expect(screen.getByText("已保存")).toBeInTheDocument();
    });

    await user.click(
      within(createdRow as HTMLElement).getByRole("button", {
        name: "编辑",
      }),
    );
    expect(await screen.findByRole("dialog", { name: "任务详情" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "删除任务" }));
    expect(screen.getByText("确认删除？")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "确认删除任务" }));

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "补充任务入口"),
      ).toBeUndefined();
    });
    expect(screen.queryByText("补充任务入口")).not.toBeInTheDocument();
    expect(screen.getByText("任务已删除")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "撤回" }));
    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "补充任务入口")?.projectId,
      ).toBe(project.id);
      const restoredTask = useTaskStore
        .getState()
        .tasks.find((task) => task.title === "补充任务入口");
      expect(useFocusStore.getState().focusRefs.some((ref) => ref.taskId === restoredTask?.id)).toBe(
        true,
      );
    });
    expect(screen.getByText("补充任务入口")).toBeInTheDocument();
    expect(screen.queryByText("任务已删除")).not.toBeInTheDocument();

    const doingColumn = screen.getByRole("heading", { level: 3, name: "进行中" }).closest("section");
    expect(doingColumn).not.toBeNull();
    expect(
      within(doingColumn as HTMLElement).getByText("需要等设计方向最终确认，再进入样式收敛。"),
    ).toBeInTheDocument();
    const inProgressRow = within(doingColumn as HTMLElement)
      .getByText("梳理交互状态")
      .closest(".task-board-item");
    expect(inProgressRow).not.toBeNull();
    await user.click(
      within(inProgressRow as HTMLElement).getByRole("button", {
        name: "完成",
      }),
    );

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "梳理交互状态")?.status,
      ).toBe("done");
      expect(screen.getByText("任务已完成")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "撤回" }));
    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "梳理交互状态")?.status,
      ).toBe("in_progress");
    });
    expect(screen.queryByText("任务已完成")).not.toBeInTheDocument();

    const blockedRow = within(doingColumn as HTMLElement)
      .getByText("等待设计确认")
      .closest(".task-board-item");
    expect(blockedRow).not.toBeNull();
    expect(within(blockedRow as HTMLElement).getByText("阻塞")).toBeInTheDocument();
    expect(
      within(blockedRow as HTMLElement).queryByRole("button", { name: "修改优先级：普通" }),
    ).toBeNull();
    expect(
      within(blockedRow as HTMLElement).getByRole("button", {
        name: "解阻",
      }),
    ).toBeInTheDocument();
    expect(
      within(blockedRow as HTMLElement).queryByRole("combobox", {
        name: "修改状态：等待设计确认",
      }),
    ).toBeNull();
    await user.click(
      within(blockedRow as HTMLElement).getByRole("button", {
        name: "解阻",
      }),
    );

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "等待设计确认")?.status,
      ).toBe("in_progress");
    });

    const completedColumn = screen.getByRole("heading", { level: 3, name: "已完成" }).closest("section");
    expect(completedColumn).not.toBeNull();
    expect(
      within(completedColumn as HTMLElement).getByText("日报结构已可生成。"),
    ).toBeInTheDocument();
    await user.click(
      within(completedColumn as HTMLElement).getByRole("button", {
        name: "回退",
      }),
    );

    await waitFor(() => {
      expect(
        useTaskStore.getState().tasks.find((task) => task.title === "完成日报结构")?.status,
      ).toBe("in_progress");
    });
  });
});
