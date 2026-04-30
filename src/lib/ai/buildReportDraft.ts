import type { Project } from "../../types/project";
import { createEmptyDraft, type ReportDraft, type ReportType } from "../../types/report";
import type { Task } from "../../types/task";

function compact(value?: string) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function formatCompletedAt(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatChecklist(task: Task) {
  if (task.checklist.length === 0) {
    return "";
  }

  return task.checklist
    .map((item) => `${item.done ? "[x]" : "[ ]"} ${compact(item.text)}`)
    .join("; ");
}

function buildTaskContext(task: Task, projectName: string) {
  const completion = task.completionWrapUp;
  const fields = [
    `项目：${projectName}`,
    `标题：${compact(task.title)}`,
    compact(task.body) ? `正文：${compact(task.body)}` : "",
    compact(task.notes) ? `备注：${compact(task.notes)}` : "",
    formatChecklist(task) ? `Tasklist：${formatChecklist(task)}` : "",
    compact(completion?.summary) ? `完成摘要：${compact(completion?.summary)}` : "",
    compact(completion?.keyChanges) ? `关键改动：${compact(completion?.keyChanges)}` : "",
    compact(completion?.notes) ? `完成备注：${compact(completion?.notes)}` : "",
    formatCompletedAt(completion?.completedAt) ? `完成时间：${formatCompletedAt(completion?.completedAt)}` : "",
  ].filter(Boolean);

  return fields.join(" / ");
}

export function getReportRange(
  type: ReportType,
  now = new Date(),
): { rangeEnd: string; rangeStart: string } {
  const current = new Date(now);
  const rangeStart = new Date(current);

  if (type === "custom" || type === "daily") {
    rangeStart.setHours(0, 0, 0, 0);
  } else if (type === "weekly") {
    const day = rangeStart.getDay() || 7;
    rangeStart.setDate(rangeStart.getDate() - day + 1);
    rangeStart.setHours(0, 0, 0, 0);
  } else {
    rangeStart.setDate(1);
    rangeStart.setHours(0, 0, 0, 0);
  }

  return {
    rangeEnd: current.toISOString(),
    rangeStart: rangeStart.toISOString(),
  };
}

export function buildReportDraft(
  tasks: Task[],
  projects: Project[],
  type: ReportType,
  now = new Date(),
  rangeOverride?: { rangeEnd: string; rangeStart: string },
): { draft: ReportDraft; sourceTasks: Task[] } {
  const { rangeEnd, rangeStart } = rangeOverride ?? getReportRange(type, now);
  const completedTasks = tasks
    .filter((task) => {
      if (task.status !== "done" || !task.completionWrapUp?.completedAt) {
        return false;
      }

      return (
        task.completionWrapUp.completedAt >= rangeStart &&
        task.completionWrapUp.completedAt <= rangeEnd
      );
    })
    .sort((left, right) =>
      (left.completionWrapUp?.completedAt ?? left.updatedAt).localeCompare(
        right.completionWrapUp?.completedAt ?? right.updatedAt,
      ),
    );

  if (completedTasks.length === 0) {
    return {
      draft: {
        ...createEmptyDraft(),
        overview: "本期没有已完成任务，可稍后重新生成。",
      },
      sourceTasks: [],
    };
  }

  const draft = createEmptyDraft();
  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

  draft.overview = `本期共完成 ${completedTasks.length} 项任务，覆盖 ${new Set(
    completedTasks.map((task) => task.projectId),
  ).size} 个项目。`;

  draft.completedItems = completedTasks.map((task) => {
    const projectName = projectNameById.get(task.projectId) ?? "未命名项目";
    return buildTaskContext(task, projectName);
  });

  draft.keyChanges = completedTasks
    .map((task) => task.completionWrapUp?.keyChanges || task.progressLog[0]?.content || "")
    .filter(Boolean);

  draft.blockers = completedTasks
    .flatMap((task) =>
      task.progressLog
        .filter((entry) => entry.content.includes("阻塞") || entry.content.includes("卡住"))
        .map((entry) => entry.content),
    )
    .slice(0, 5);

  draft.nextSteps = completedTasks
    .map((task) => task.completionWrapUp?.notes || "")
    .filter(Boolean);

  return {
    draft,
    sourceTasks: completedTasks,
  };
}
