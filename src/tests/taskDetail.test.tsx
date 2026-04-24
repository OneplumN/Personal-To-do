import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { TaskDetailPanel } from "../components/tasks/TaskDetailPanel";
import { resetDatabase } from "../lib/storage/db";
import { projectRepository } from "../lib/storage/projectRepository";
import { taskRepository } from "../lib/storage/taskRepository";
import { useFocusStore } from "../features/focus/focusStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { createProject } from "../types/project";
import { createTask } from "../types/task";
import { renderWithRouter } from "./test-utils";

describe("Task detail", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: true, projects: [] });
    useTaskStore.setState({ isLoaded: true, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: true });
  });

  test("renders a checklist-first drawer and supports compact checklist editing", async () => {
    const project = createProject({ name: "Project Gamma" });
    const task = createTask({ projectId: project.id, title: "编写日报素材" });

    await projectRepository.save(project);
    await taskRepository.save(task);
    useProjectStore.setState({ isLoaded: true, projects: [project] });
    useTaskStore.setState({ isLoaded: true, tasks: [task] });

    const user = userEvent.setup();
    renderWithRouter(
      <TaskDetailPanel onClose={() => undefined} project={project} taskId={task.id} />,
    );

    expect(screen.getByRole("dialog", { name: "任务详情" })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("标题"));
    await user.type(screen.getByLabelText("标题"), "编写日报与周报素材");
    await user.type(screen.getByPlaceholderText("添加子任务"), "补充完成说明");
    await user.click(screen.getByRole("button", { name: "添加" }));
    await user.click(screen.getByRole("button", { name: "补充完成说明" }));
    await user.clear(screen.getByLabelText("编辑子项"));
    await user.type(screen.getByLabelText("编辑子项"), "补充完成说明-已编辑");
    await user.click(screen.getByRole("button", { name: "下移子项" }));
    await user.click(screen.getByRole("button", { name: "删除子项" }));

    await user.type(screen.getByLabelText("正文"), "完成了结构化草稿整理");
    await user.type(screen.getByLabelText("备注"), "日报可直接使用。");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      const nextTask = useTaskStore.getState().tasks[0];
      expect(nextTask.title).toBe("编写日报与周报素材");
      expect(nextTask.body).toContain("完成了结构化草稿整理");
      expect(nextTask.notes).toContain("日报可直接使用。");
      expect(nextTask.checklist).toHaveLength(0);
    });

    await user.selectOptions(screen.getByLabelText("状态"), "done");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(useTaskStore.getState().tasks[0]?.status).toBe("done");
    });
  });
});
