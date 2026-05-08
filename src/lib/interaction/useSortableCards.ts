import { useEffect, useRef, useState } from "react";

const DEFAULT_EXCLUDE_SELECTOR = "button, input, select, textarea, a, [data-no-drag='true']";

export type DropPosition = "after" | "before";

export type SortableDragState = {
  draggedId: string | null;
  dropPosition: DropPosition;
  overId: string | null;
};

type DragSession = {
  active: boolean;
  dropPosition: DropPosition;
  element: HTMLElement;
  offsetX: number;
  offsetY: number;
  previewElement: HTMLElement | null;
  pointerId: number;
  startX: number;
  startY: number;
  targetId: string | null;
  taskId: string;
};

export function useSortableCards({
  excludeSelector = DEFAULT_EXCLUDE_SELECTOR,
  onReorder,
  selector,
}: {
  excludeSelector?: string;
  onReorder: (draggedId: string, targetId: string, position: DropPosition) => void;
  selector: string;
}) {
  const dragSessionRef = useRef<DragSession | null>(null);
  const [dragState, setDragState] = useState<SortableDragState>({
    draggedId: null,
    dropPosition: "before",
    overId: null,
  });

  function clearDragState() {
    dragSessionRef.current?.previewElement?.remove();
    document.body.classList.remove("sortable-dragging");
    dragSessionRef.current = null;
    setDragState({
      draggedId: null,
      dropPosition: "before",
      overId: null,
    });
  }

  function findCardFromPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY);
    return element?.closest<HTMLElement>(selector) ?? null;
  }

  function getDropPosition(card: HTMLElement, clientY: number): DropPosition {
    const rect = card.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2 ? "before" : "after";
  }

  function createPreviewElement(session: DragSession) {
    if (session.previewElement) {
      return session.previewElement;
    }

    const rect = session.element.getBoundingClientRect();
    const previewElement = session.element.cloneNode(true) as HTMLElement;
    previewElement.removeAttribute("data-sortable-id");
    previewElement.setAttribute("aria-hidden", "true");
    previewElement.classList.remove(
      "focus-card--dragging",
      "focus-card--drop-after",
      "focus-card--drop-before",
      "focus-card--target",
      "project-card--dragging",
      "project-card--drop-after",
      "project-card--drop-before",
      "project-card--target",
    );
    previewElement.classList.add("sortable-drag-preview");
    previewElement.style.height = `${rect.height}px`;
    previewElement.style.left = "0";
    previewElement.style.margin = "0";
    previewElement.style.position = "fixed";
    previewElement.style.top = "0";
    previewElement.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(1.015)`;
    previewElement.style.width = `${rect.width}px`;

    document.body.append(previewElement);
    document.body.classList.add("sortable-dragging");
    session.previewElement = previewElement;
    return previewElement;
  }

  function movePreviewElement(session: DragSession, clientX: number, clientY: number) {
    const previewElement = createPreviewElement(session);
    previewElement.style.transform = `translate3d(${clientX - session.offsetX}px, ${clientY - session.offsetY}px, 0) scale(1.015)`;
  }

  function handlePointerMove(event: PointerEvent) {
    const session = dragSessionRef.current;
    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    const movedX = Math.abs(event.clientX - session.startX);
    const movedY = Math.abs(event.clientY - session.startY);
    if (!session.active && Math.max(movedX, movedY) < 6) {
      return;
    }

    event.preventDefault();
    session.active = true;
    movePreviewElement(session, event.clientX, event.clientY);

    const targetCard = findCardFromPoint(event.clientX, event.clientY);
    const nextTargetId = targetCard?.dataset.sortableId ?? null;
    const dropPosition = targetCard ? getDropPosition(targetCard, event.clientY) : "before";
    session.dropPosition = dropPosition;
    session.targetId = nextTargetId;

    setDragState({
      draggedId: session.taskId,
      dropPosition,
      overId: nextTargetId && nextTargetId !== session.taskId ? nextTargetId : null,
    });
  }

  function handlePointerUp(event: PointerEvent) {
    const session = dragSessionRef.current;
    if (!session || event.pointerId !== session.pointerId) {
      return;
    }

    if (session.active && session.targetId && session.targetId !== session.taskId) {
      onReorder(session.taskId, session.targetId, session.dropPosition);
    }
    clearDragState();
  }

  function beginDrag(event: React.PointerEvent<HTMLElement>, id: string) {
    if (
      event.button > 0 ||
      event.target instanceof HTMLElement &&
        event.target.closest(excludeSelector)
    ) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    dragSessionRef.current = {
      active: false,
      dropPosition: "before",
      element: event.currentTarget,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      previewElement: null,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      targetId: null,
      taskId: id,
    };
  }

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", clearDragState);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", clearDragState);
    };
  });

  return {
    beginDrag,
    dragState,
  };
}

export function getReorderedIds(
  ids: string[],
  draggedId: string,
  targetId: string,
  position: DropPosition,
) {
  if (draggedId === targetId) {
    return ids;
  }

  const withoutDragged = ids.filter((id) => id !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  if (targetIndex === -1) {
    return ids;
  }

  const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
  return [
    ...withoutDragged.slice(0, insertIndex),
    draggedId,
    ...withoutDragged.slice(insertIndex),
  ];
}
