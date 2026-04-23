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

  test("edits task content, checklist, progress logs, and completion wrap-up", async () => {
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

    await user.clear(screen.getByLabelText("标题"));
    await user.type(screen.getByLabelText("标题"), "编写日报与周报素材");
    await user.click(screen.getByRole("button", { name: "保存修改" }));

    await user.type(screen.getByPlaceholderText("添加子任务"), "补充完成说明");
    await user.click(screen.getByRole("button", { name: "添加" }));

    await user.type(
      screen.getByPlaceholderText("补充一条最新进展或修改记录"),
      "完成了结构化草稿整理",
    );
    await user.click(screen.getByRole("button", { name: "追加记录" }));

    await user.selectOptions(screen.getByLabelText("状态"), "done");
    await user.type(screen.getByLabelText("完成说明"), "日报与周报素材已整理");
    await user.type(screen.getByLabelText("关键改动"), "新增结构化摘要");
    await user.click(screen.getByRole("button", { name: "确认完成" }));

    await waitFor(() => {
      const nextTask = useTaskStore.getState().tasks[0];
      expect(nextTask.title).toBe("编写日报与周报素材");
      expect(nextTask.checklist[0]?.text).toBe("补充完成说明");
      expect(nextTask.progressLog[0]?.content).toBe("完成了结构化草稿整理");
      expect(nextTask.completionWrapUp?.summary).toBe("日报与周报素材已整理");
      expect(nextTask.status).toBe("done");
    });
  });
});
