import { useRef, useState } from "react";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABELS,
} from "../../lib/constants";
import type { Project } from "../../types/project";
import type { Task, TaskPriority, TaskStatus } from "../../types/task";

export type FocusListItem = {
  project: Project;
  task: Task;
};

const SWIPE_THRESHOLD = 88;
const SWIPE_PREVIEW_LIMIT = 116;
const TODAY_FOCUS_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "blocked"];

function FocusPriorityBadge({
  onChangePriority,
  priority,
  taskId,
}: {
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  priority: TaskPriority;
  taskId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="priority-badge-wrap" data-focus-control="true">
      <button
        aria-expanded={open}
        className={`priority-pill priority-pill--${priority} priority-pill--button`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        type="button"
      >
        {TASK_PRIORITY_LABELS[priority]}
      </button>

      {open ? (
        <div className="priority-menu" role="menu">
          {TASK_PRIORITY_ORDER.map((nextPriority) => (
            <button
              className={
                nextPriority === priority
                  ? "priority-menu__item priority-menu__item--active"
                  : "priority-menu__item"
              }
              key={nextPriority}
              onClick={(event) => {
                event.stopPropagation();
                onChangePriority(taskId, nextPriority);
                setOpen(false);
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

function FocusRow({
  item,
  onChangePriority,
  onOpenTask,
  onRemoveTask,
  onUpdateStatus,
}: {
  item: FocusListItem;
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}) {
  const { project, task } = item;
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
  });
  const suppressClickRef = useRef(false);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("[data-focus-control='true']")) {
      return;
    }
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
    };
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    const delta = event.clientX - dragRef.current.startX;
    const limited = Math.max(-SWIPE_PREVIEW_LIMIT, Math.min(SWIPE_PREVIEW_LIMIT, delta));
    if (Math.abs(limited) > 6) {
      suppressClickRef.current = true;
    }
    setDragOffset(limited);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    if (typeof event.currentTarget.releasePointerCapture === "function") {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
    };

    if (dragOffset >= SWIPE_THRESHOLD) {
      onUpdateStatus(task.id, "done");
    } else if (dragOffset <= -SWIPE_THRESHOLD) {
      onRemoveTask(task.id);
    }

    setDragOffset(0);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function handleRowClick() {
    if (suppressClickRef.current) {
      return;
    }
    onOpenTask(task.id);
  }

  return (
    <article className="focus-row" key={task.id}>
      <div className="focus-row__background focus-row__background--left" aria-hidden="true">
        <span>❌ 移出焦点</span>
      </div>
      <div className="focus-row__background focus-row__background--right" aria-hidden="true">
        <span>✅ 完成</span>
      </div>

      <div
        className="focus-row__sheet"
        onClick={handleRowClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{ transform: `translateX(${dragOffset}px)` }}
      >
        <div className="focus-row__header">
          <FocusPriorityBadge
            onChangePriority={onChangePriority}
            priority={task.priority}
            taskId={task.id}
          />
          <h3>{task.title}</h3>
        </div>

        <div className="focus-row__meta">
          <span>{project.name}</span>
          <span>最近更新 {new Date(task.updatedAt).toLocaleString("zh-CN")}</span>
        </div>

        <div
          aria-label={`${task.title} 状态操作`}
          className="focus-status-slider"
          data-focus-control="true"
          role="group"
        >
          {TODAY_FOCUS_STATUS_ORDER.map((status) => (
            <button
              className={
                task.status === status
                  ? "focus-status-slider__item focus-status-slider__item--active"
                  : "focus-status-slider__item"
              }
              key={status}
              onClick={(event) => {
                event.stopPropagation();
                onUpdateStatus(task.id, status);
              }}
              type="button"
            >
              {TASK_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function FocusList({
  items,
  onChangePriority,
  onOpenTask,
  onRemoveTask,
  onUpdateStatus,
}: {
  items: FocusListItem[];
  onChangePriority: (taskId: string, priority: TaskPriority) => void;
  onOpenTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Today Focus</p>
        <h3>今天还没有焦点任务</h3>
        <p>从项目中的任务手动加入今日焦点，首页就会集中显示它们。</p>
      </div>
    );
  }

  return (
    <div className="focus-list focus-list--compact">
      {items.map((item) => (
        <FocusRow
          item={item}
          key={item.task.id}
          onChangePriority={onChangePriority}
          onOpenTask={onOpenTask}
          onRemoveTask={onRemoveTask}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
