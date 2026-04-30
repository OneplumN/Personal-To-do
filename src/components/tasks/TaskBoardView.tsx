import { useState } from "react";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_ORDER } from "../../lib/constants";
import type { Task, TaskPriority, TaskStatus } from "../../types/task";

function getPrimaryAction(status: TaskStatus) {
  if (status === "todo") {
    return { label: "推进", nextStatus: "in_progress" as const };
  }

  if (status === "in_progress") {
    return { label: "完成", nextStatus: "done" as const };
  }

  if (status === "blocked") {
    return { label: "解阻", nextStatus: "in_progress" as const };
  }

  return { label: "回退", nextStatus: "in_progress" as const };
}

function QuickActionIcon({ status }: { status: TaskStatus }) {
  if (status === "todo" || status === "blocked") {
    if (status === "blocked") {
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
          <path
            d="M11.75 6.5V4.75H10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M11.25 4.75A4.75 4.75 0 1 0 12.5 8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    }

    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
        <path
          d="M3.5 8H11"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 5.5L11 8L8.5 10.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (status === "in_progress") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path
        d="M6.25 5.25 3.75 7.75l2.5 2.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M4 7.75h5.25a3.25 3.25 0 1 1-2.65 5.13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EditTaskIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 20h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M15.5 4.5a2.12 2.12 0 1 1 3 3L8 18l-4 1 1-4 10.5-10.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FocusTargetIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 20.25a8.25 8.25 0 1 0 0-16.5 8.25 8.25 0 0 0 0 16.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      {active ? (
        <path
          d="M12 12h.01"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      ) : null}
    </svg>
  );
}

function TaskPriorityControl({
  open,
  onChangePriority,
  onOpenChange,
  priority,
  taskId,
}: {
  open: boolean;
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenChange: (open: boolean) => void;
  priority: TaskPriority;
  taskId: string;
}) {
  return (
    <div className="task-row-priority" data-priority-control="true">
      <button
        aria-expanded={open}
        aria-label={`修改优先级：${TASK_PRIORITY_LABELS[priority]}`}
        className={`priority-pill priority-pill--${priority} task-row-priority__trigger`}
        onClick={() => onOpenChange(!open)}
        title="修改优先级"
        type="button"
      >
        {TASK_PRIORITY_LABELS[priority]}
      </button>

      {open ? (
        <div className="task-row-priority__menu" role="menu">
          {TASK_PRIORITY_ORDER.map((nextPriority) => (
            <button
              className={
                nextPriority === priority
                  ? `task-row-priority__option task-row-priority__option--${nextPriority} task-row-priority__option--active`
                  : `task-row-priority__option task-row-priority__option--${nextPriority}`
              }
              key={nextPriority}
              onClick={() => {
                onChangePriority(taskId, nextPriority);
                onOpenChange(false);
              }}
              type="button"
            >
              {TASK_PRIORITY_LABELS[nextPriority]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BlockedStatusPill() {
  return (
    <span className="task-row-blocked-pill" title="阻塞中">
      阻塞
    </span>
  );
}

function formatTaskTimestamp(task: Task) {
  const timestamp = new Date(task.completionWrapUp?.completedAt ?? task.updatedAt);

  return `${timestamp.getMonth() + 1}月${timestamp.getDate()}日`;
}

function getTaskPreview(task: Task) {
  if (task.status === "done") {
    return task.completionWrapUp?.summary || task.body;
  }

  return task.body;
}

function getChecklistSummary(task: Task) {
  if (task.checklist.length === 0) {
    return null;
  }

  const checklistDone = task.checklist.filter((item) => item.done).length;
  return `清单 ${checklistDone}/${task.checklist.length}`;
}

function TaskBoardRow({
  inFocus,
  onChangePriority,
  onOpenTask,
  onToggleFocus,
  onUpdateStatus,
  task,
}: {
  inFocus: boolean;
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenTask: (taskId: string) => void;
  onToggleFocus: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  task: Task;
}) {
  const checklistSummary = getChecklistSummary(task);
  const preview = getTaskPreview(task);
  const primaryAction = getPrimaryAction(task.status);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

  return (
    <article
      className={
        priorityMenuOpen
          ? `task-board-item task-board-item--${task.status} task-board-item--menu-open`
          : `task-board-item task-board-item--${task.status}`
      }
    >
      <div className="task-board-item__layout">
        <div className="task-board-item__content">
          <div className="task-board-item__heading">
            <div className="task-board-item__titleline">
              <span aria-hidden="true" className="task-board-item__state-dot" />
              {task.status === "blocked" ? (
                <BlockedStatusPill />
              ) : (
                <TaskPriorityControl
                  open={priorityMenuOpen}
                  onChangePriority={onChangePriority}
                  onOpenChange={setPriorityMenuOpen}
                  priority={task.priority}
                  taskId={task.id}
                />
              )}
              <h4>{task.title}</h4>
            </div>
          </div>
          {preview ? <p className="task-board-item__preview">{preview}</p> : null}

          <div className="task-board-item__footer">
            <div className="task-board-item__meta">
              {checklistSummary ? <span>{checklistSummary}</span> : null}
              <span>{formatTaskTimestamp(task)}</span>
            </div>
          </div>
        </div>

        <div className="task-board-item__tools">
          <button
            aria-label={inFocus ? "移出" : "加入"}
            className={
              inFocus
                ? "task-board-item__focus task-board-item__focus--active"
                : "task-board-item__focus"
            }
            data-tooltip={inFocus ? "移出" : "加入"}
            onClick={() => onToggleFocus(task.id)}
            title={inFocus ? "移出" : "加入"}
            type="button"
          >
            <FocusTargetIcon active={inFocus} />
          </button>
          <button
            aria-label="编辑"
            className="task-board-item__edit"
            data-tooltip="编辑"
            onClick={() => onOpenTask(task.id)}
            title="编辑"
            type="button"
          >
            <EditTaskIcon />
          </button>
          <button
            aria-label={primaryAction.label}
            className="task-board-item__action"
            data-tooltip={primaryAction.label}
            onClick={() => onUpdateStatus(task.id, primaryAction.nextStatus)}
            title={primaryAction.label}
            type="button"
          >
            <QuickActionIcon status={task.status} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function TaskBoardView({
  focusTaskIds = [],
  onChangePriority,
  onOpenTask,
  onToggleFocus,
  onUpdateStatus,
  tasks,
}: {
  focusTaskIds?: string[];
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenTask: (taskId: string) => void;
  onToggleFocus?: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  tasks: Task[];
}) {
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress" || task.status === "blocked",
  );
  const doneTasks = tasks.filter((task) => task.status === "done");

  const columns = [
    {
      body: todoTasks,
      key: "todo",
      label: "待做",
    },
    {
      body: inProgressTasks,
      key: "in_progress",
      label: "进行中",
    },
    {
      body: doneTasks,
      key: "done",
      label: "已完成",
    },
  ] as const;

  return (
    <div className="task-board task-board--list">
      {columns.map((column) => (
        <section className={`task-column task-column--${column.key}`} key={column.key}>
          <header className="task-column__header">
            <h3>{column.label}</h3>
            <span>{column.body.length}</span>
          </header>

          <div className="task-column__scroll">
            <div className="task-column__body">
              {column.body.length === 0 ? (
                <div className="task-column__empty">
                  <p>{column.label} 暂时没有任务。</p>
                </div>
              ) : (
                column.body.map((task) => (
                  <TaskBoardRow
                    inFocus={focusTaskIds.includes(task.id)}
                    onChangePriority={onChangePriority}
                    key={task.id}
                    onOpenTask={onOpenTask}
                    onToggleFocus={onToggleFocus ?? (() => undefined)}
                    onUpdateStatus={onUpdateStatus}
                    task={task}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
