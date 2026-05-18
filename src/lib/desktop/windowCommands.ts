import { isTauriRuntime } from "../platform/runtime";
import type { Monitor, Window as TauriWindow } from "@tauri-apps/api/window";
import type { TodayStepHandlePosition } from "../../types/preferences";

export const TODAY_STEP_OPEN_TASK_EVENT = "today-step:open-task";
export const TODAY_STEP_REFRESH_EVENT = "today-step:refresh";

export type MainWindowOpenTarget = {
  projectId?: string;
  taskId?: string;
};

type TodayStepWindowOptions = {
  docked?: boolean;
  handlePosition?: TodayStepHandlePosition;
  pinned?: boolean;
};

const TODAY_STEP_EXPANDED_SIZE = {
  height: 620,
  width: 440,
};

const MAIN_WINDOW_DEFAULT_MIN_SIZE = {
  height: 720,
  width: 1080,
};

const MAIN_WINDOW_TODAY_MODE_MIN_SIZE = {
  height: 520,
  width: 360,
};

const TODAY_STEP_HANDLE_SIZE = {
  height: 156,
  width: 48,
};

const TODAY_EXECUTION_RESTORE_KEY = "yibu:today-execution-restore";
const TODAY_STEP_EDGE_GAP = 12;
const TODAY_STEP_HANDLE_EDGE_GAP = 2;
const MONITOR_MATCH_TOLERANCE = 2;

type TodayExecutionRestoreState = {
  height: number;
  path: string;
  width: number;
  x: number;
  y: number;
};

type WindowFrame = {
  height: number;
  width: number;
  x: number;
  y: number;
};

function readTodayExecutionRestoreState(): TodayExecutionRestoreState | null {
  try {
    const rawState = window.sessionStorage.getItem(TODAY_EXECUTION_RESTORE_KEY);
    if (!rawState) {
      return null;
    }

    const state = JSON.parse(rawState) as Partial<TodayExecutionRestoreState>;
    if (
      typeof state.height !== "number" ||
      typeof state.width !== "number" ||
      typeof state.x !== "number" ||
      typeof state.y !== "number"
    ) {
      return null;
    }

    return {
      height: state.height,
      path: typeof state.path === "string" && state.path ? state.path : "/",
      width: state.width,
      x: state.x,
      y: state.y,
    };
  } catch {
    return null;
  }
}

function writeTodayExecutionRestoreState(state: TodayExecutionRestoreState) {
  try {
    window.sessionStorage.setItem(TODAY_EXECUTION_RESTORE_KEY, JSON.stringify(state));
  } catch {
    // Session storage is only used to restore the current desktop session.
  }
}

function clearTodayExecutionRestoreState() {
  try {
    window.sessionStorage.removeItem(TODAY_EXECUTION_RESTORE_KEY);
  } catch {
    // Ignore storage failures and keep the window usable.
  }
}

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function nextAnimationFrame(): Promise<number> {
  if (typeof window.requestAnimationFrame === "function") {
    return new Promise((resolve) => {
      window.requestAnimationFrame(resolve);
    });
  }

  return new Promise((resolve) => {
    window.setTimeout(() => resolve(Date.now()), 16);
  });
}

async function animateWindowFrame(
  window: TauriWindow,
  fromFrame: WindowFrame,
  toFrame: WindowFrame,
  durationMs = 190,
) {
  const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/window");
  const startTime = await nextAnimationFrame();

  while (true) {
    const now = await nextAnimationFrame();
    const progress = Math.min(1, (now - startTime) / durationMs);
    const easedProgress = easeInOutCubic(progress);
    const currentFrame = {
      height: fromFrame.height + (toFrame.height - fromFrame.height) * easedProgress,
      width: fromFrame.width + (toFrame.width - fromFrame.width) * easedProgress,
      x: fromFrame.x + (toFrame.x - fromFrame.x) * easedProgress,
      y: fromFrame.y + (toFrame.y - fromFrame.y) * easedProgress,
    };

    await Promise.all([
      window.setSize(new LogicalSize(currentFrame.width, currentFrame.height)),
      window.setPosition(new LogicalPosition(currentFrame.x, currentFrame.y)),
    ]);

    if (progress >= 1) {
      break;
    }
  }
}

export async function openMainWindow(target: MainWindowOpenTarget = {}) {
  if (!isTauriRuntime()) {
    return;
  }

  const [{ Window, getCurrentWindow }, { emitTo }] = await Promise.all([
    import("@tauri-apps/api/window"),
    import("@tauri-apps/api/event"),
  ]);
  const mainWindow = await Window.getByLabel("main");

  await mainWindow?.show();
  await mainWindow?.unminimize();
  await mainWindow?.setFocus();
  await emitTo("main", TODAY_STEP_OPEN_TASK_EVENT, target);

  const currentWindow = getCurrentWindow();
  if (currentWindow.label === "today-step" || currentWindow.label === "today-step-handle") {
    await currentWindow.hide();
  }
}

export async function setTodayStepPinned(pinned: boolean) {
  if (!isTauriRuntime()) {
    return;
  }

  const { Window } = await import("@tauri-apps/api/window");
  const todayStepWindow = await Window.getByLabel("today-step");
  await todayStepWindow?.setAlwaysOnTop(pinned);
  await todayStepWindow?.setVisibleOnAllWorkspaces(pinned);
}

export async function enterTodayExecutionMode(currentPath: string): Promise<boolean> {
  if (!isTauriRuntime()) {
    return false;
  }

  const { LogicalSize, currentMonitor, getCurrentWindow } = await import("@tauri-apps/api/window");
  const currentWindow = getCurrentWindow();
  if (currentWindow.label !== "main") {
    return false;
  }

  const [position, size, scaleFactor] = await Promise.all([
    currentWindow.outerPosition(),
    currentWindow.outerSize(),
    currentWindow.scaleFactor(),
  ]);
  const safeScaleFactor = scaleFactor || 1;
  const restoreState: TodayExecutionRestoreState = {
    height: size.height / safeScaleFactor,
    path: currentPath || "/",
    width: size.width / safeScaleFactor,
    x: position.x / safeScaleFactor,
    y: position.y / safeScaleFactor,
  };
  writeTodayExecutionRestoreState(restoreState);

  const monitor = await currentMonitor();
  const workArea = monitor ? getLogicalWorkArea(monitor) : null;
  const nextX = workArea
    ? Math.min(
        Math.max(workArea.x, restoreState.x),
        workArea.x + workArea.width - TODAY_STEP_EXPANDED_SIZE.width,
      )
    : restoreState.x;
  const nextY = workArea
    ? Math.min(
        Math.max(workArea.y, restoreState.y),
        workArea.y + workArea.height - TODAY_STEP_EXPANDED_SIZE.height,
      )
    : restoreState.y;
  const targetFrame = {
    height: TODAY_STEP_EXPANDED_SIZE.height,
    width: TODAY_STEP_EXPANDED_SIZE.width,
    x: Math.round(nextX),
    y: Math.round(nextY),
  };

  await currentWindow.setMinSize(
    new LogicalSize(MAIN_WINDOW_TODAY_MODE_MIN_SIZE.width, MAIN_WINDOW_TODAY_MODE_MIN_SIZE.height),
  );
  await animateWindowFrame(currentWindow, restoreState, targetFrame);
  await currentWindow.setFocus();
  return true;
}

export async function exitTodayExecutionMode(
  target: MainWindowOpenTarget = {},
): Promise<{ path?: string; restored: boolean }> {
  if (!isTauriRuntime()) {
    return { path: "/", restored: false };
  }

  const { LogicalSize, getCurrentWindow } = await import("@tauri-apps/api/window");
  const currentWindow = getCurrentWindow();

  if (currentWindow.label !== "main") {
    await openMainWindow(target);
    return { restored: true };
  }
  const targetPath = target.projectId
    ? `/projects/${target.projectId}${target.taskId ? `?task=${encodeURIComponent(target.taskId)}` : ""}`
    : undefined;

  const restoreState = readTodayExecutionRestoreState();
  if (!restoreState) {
    await currentWindow.setMinSize(
      new LogicalSize(MAIN_WINDOW_DEFAULT_MIN_SIZE.width, MAIN_WINDOW_DEFAULT_MIN_SIZE.height),
    );
    await currentWindow.setSize(
      new LogicalSize(MAIN_WINDOW_DEFAULT_MIN_SIZE.width, MAIN_WINDOW_DEFAULT_MIN_SIZE.height),
    );
    return { path: targetPath ?? "/", restored: true };
  }

  const [position, size, scaleFactor] = await Promise.all([
    currentWindow.outerPosition(),
    currentWindow.outerSize(),
    currentWindow.scaleFactor(),
  ]);
  const safeScaleFactor = scaleFactor || 1;
  await animateWindowFrame(
    currentWindow,
    {
      height: size.height / safeScaleFactor,
      width: size.width / safeScaleFactor,
      x: position.x / safeScaleFactor,
      y: position.y / safeScaleFactor,
    },
    restoreState,
  );
  await currentWindow.setMinSize(
    new LogicalSize(MAIN_WINDOW_DEFAULT_MIN_SIZE.width, MAIN_WINDOW_DEFAULT_MIN_SIZE.height),
  );
  clearTodayExecutionRestoreState();
  return { path: targetPath ?? restoreState.path, restored: true };
}

export async function setTodayStepDocked(
  docked: boolean,
  pinned: boolean,
  handlePosition?: TodayStepHandlePosition,
): Promise<TodayStepHandlePosition | undefined> {
  if (!isTauriRuntime()) {
    return undefined;
  }

  const [{ Window }, { emitTo }, { WebviewWindow }] = await Promise.all([
    import("@tauri-apps/api/window"),
    import("@tauri-apps/api/event"),
    import("@tauri-apps/api/webviewWindow"),
  ]);
  const todayStepWindow = await Window.getByLabel("today-step");
  let todayStepHandleWindow = await Window.getByLabel("today-step-handle");

  if (!todayStepHandleWindow) {
    new WebviewWindow("today-step-handle", {
      alwaysOnTop: true,
      decorations: false,
      focus: true,
      fullscreen: false,
      height: TODAY_STEP_HANDLE_SIZE.height,
      minHeight: TODAY_STEP_HANDLE_SIZE.height,
      minWidth: TODAY_STEP_HANDLE_SIZE.width,
      resizable: false,
      title: "今日",
      url: "/today-step-handle",
      visible: false,
      visibleOnAllWorkspaces: true,
      width: TODAY_STEP_HANDLE_SIZE.width,
    });
    todayStepHandleWindow = await Window.getByLabel("today-step-handle");
  }

  if (docked) {
    const nextHandlePosition =
      (await resolveHandlePositionFromExpandedWindow(todayStepWindow)) ?? handlePosition;
    await positionTodayStepHandleWindow(todayStepHandleWindow, nextHandlePosition);
    await todayStepHandleWindow?.show();
    await todayStepHandleWindow?.unminimize();
    await todayStepHandleWindow?.setAlwaysOnTop(true);
    await todayStepHandleWindow?.setVisibleOnAllWorkspaces(true);
    await todayStepHandleWindow?.setFocus();
    await emitTo("today-step-handle", TODAY_STEP_REFRESH_EVENT);
    await todayStepWindow?.hide();
    return nextHandlePosition;
  }

  await todayStepHandleWindow?.hide();
  await showTodayStepWindow({ docked: false, handlePosition, pinned });
  return handlePosition;
}

export async function startTodayStepHandleDrag() {
  if (!isTauriRuntime()) {
    return;
  }

  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().startDragging();
}

export async function snapTodayStepHandleWindow(): Promise<TodayStepHandlePosition | undefined> {
  if (!isTauriRuntime()) {
    return undefined;
  }

  const {
    LogicalPosition,
    Window,
    currentMonitor,
    monitorFromPoint,
  } = await import("@tauri-apps/api/window");
  const todayStepHandleWindow = await Window.getByLabel("today-step-handle");
  if (!todayStepHandleWindow) {
    return undefined;
  }

  const position = await todayStepHandleWindow.outerPosition();
  const scaleFactor = await todayStepHandleWindow.scaleFactor();
  const logicalX = position.x / scaleFactor;
  const logicalY = position.y / scaleFactor;
  const monitor =
    (await monitorFromPoint(
      position.x + (TODAY_STEP_HANDLE_SIZE.width * scaleFactor) / 2,
      position.y + (TODAY_STEP_HANDLE_SIZE.height * scaleFactor) / 2,
    )) ?? (await currentMonitor());

  if (!monitor) {
    return undefined;
  }

  const monitorScale = monitor.scaleFactor || scaleFactor || 1;
  const workAreaX = monitor.workArea.position.x / monitorScale;
  const workAreaY = monitor.workArea.position.y / monitorScale;
  const workAreaWidth = monitor.workArea.size.width / monitorScale;
  const workAreaHeight = monitor.workArea.size.height / monitorScale;
  const midpoint = workAreaX + workAreaWidth / 2;
  const edge: TodayStepHandlePosition["edge"] = logicalX + TODAY_STEP_HANDLE_SIZE.width / 2 < midpoint
    ? "left"
    : "right";
  const availableY = Math.max(1, workAreaHeight - TODAY_STEP_HANDLE_SIZE.height);
  const yRatio = Math.min(1, Math.max(0, (logicalY - workAreaY) / availableY));
  const nextPosition: TodayStepHandlePosition = {
    edge,
    ...getMonitorPositionSnapshot(monitor),
    yRatio,
  };

  await positionTodayStepHandleWindow(todayStepHandleWindow, nextPosition);
  return nextPosition;
}

async function resolveHandlePositionFromExpandedWindow(
  todayStepWindow: TauriWindow | null,
): Promise<TodayStepHandlePosition | undefined> {
  if (!todayStepWindow) {
    return undefined;
  }

  const monitor = await resolveWindowMonitor(todayStepWindow, TODAY_STEP_EXPANDED_SIZE);
  if (!monitor) {
    return undefined;
  }

  try {
    const position = await todayStepWindow.outerPosition();
    const scaleFactor = await todayStepWindow.scaleFactor();
    const logicalX = position.x / scaleFactor;
    const logicalY = position.y / scaleFactor;
    const workArea = getLogicalWorkArea(monitor);
    const midpoint = workArea.x + workArea.width / 2;
    const edge: TodayStepHandlePosition["edge"] =
      logicalX + TODAY_STEP_EXPANDED_SIZE.width / 2 < midpoint ? "left" : "right";
    const availableY = Math.max(1, workArea.height - TODAY_STEP_HANDLE_SIZE.height);
    const centeredHandleY = logicalY + (TODAY_STEP_EXPANDED_SIZE.height - TODAY_STEP_HANDLE_SIZE.height) / 2;
    const yRatio = clampRatio((centeredHandleY - workArea.y) / availableY);

    return {
      edge,
      ...getMonitorPositionSnapshot(monitor),
      yRatio,
    };
  } catch {
    return undefined;
  }
}

async function applyTodayStepWindowMode(
  todayStepWindow: TauriWindow | null,
  { handlePosition, pinned }: Required<TodayStepWindowOptions>,
  monitorOverride?: Monitor | null,
) {
  if (!todayStepWindow) {
    return;
  }

  const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/window");
  const targetSize = TODAY_STEP_EXPANDED_SIZE;
  const targetMinSize = { height: 520, width: 360 };
  const monitor =
    monitorOverride ??
    (await resolveMonitorForHandlePosition(handlePosition)) ??
    (await resolveCursorMonitor()) ??
    (await resolveWindowMonitor(todayStepWindow, TODAY_STEP_EXPANDED_SIZE));

  await todayStepWindow.setMinSize(new LogicalSize(targetMinSize.width, targetMinSize.height));
  await todayStepWindow.setSize(new LogicalSize(targetSize.width, targetSize.height));
  await todayStepWindow.setAlwaysOnTop(pinned);
  await todayStepWindow.setVisibleOnAllWorkspaces(pinned);

  if (!monitor) {
    return;
  }

  const workArea = getLogicalWorkArea(monitor);
  const edge = handlePosition.edge ?? "right";
  const x =
    edge === "left"
      ? Math.round(workArea.x + TODAY_STEP_HANDLE_SIZE.width + TODAY_STEP_EDGE_GAP)
      : Math.round(workArea.x + workArea.width - targetSize.width - TODAY_STEP_EDGE_GAP);
  const availableY = Math.max(0, workArea.height - targetSize.height);
  const y = Math.round(workArea.y + availableY * clampRatio(handlePosition.yRatio));

  await todayStepWindow.setPosition(new LogicalPosition(x, y));
}

async function positionTodayStepHandleWindow(
  todayStepHandleWindow: TauriWindow | null,
  position: TodayStepHandlePosition = {
    edge: "right",
    yRatio: 0.5,
  },
) {
  if (!todayStepHandleWindow) {
    return;
  }

  const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/window");
  const monitor = await resolveMonitorForHandlePosition(position) ?? await resolveCursorMonitor();

  await todayStepHandleWindow.setSize(
    new LogicalSize(TODAY_STEP_HANDLE_SIZE.width, TODAY_STEP_HANDLE_SIZE.height),
  );

  if (!monitor) {
    return;
  }

  const workArea = getLogicalWorkArea(monitor);
  const x =
    position.edge === "left"
      ? Math.round(workArea.x + TODAY_STEP_HANDLE_EDGE_GAP)
      : Math.round(
          workArea.x + workArea.width - TODAY_STEP_HANDLE_SIZE.width - TODAY_STEP_HANDLE_EDGE_GAP,
        );
  const availableY = Math.max(0, workArea.height - TODAY_STEP_HANDLE_SIZE.height);
  const y = Math.round(workArea.y + availableY * clampRatio(position.yRatio));

  await todayStepHandleWindow.setPosition(new LogicalPosition(x, y));
}

async function resolveCursorMonitor(): Promise<Monitor | null> {
  const { currentMonitor, cursorPosition, monitorFromPoint } = await import("@tauri-apps/api/window");

  try {
    const cursor = await cursorPosition();
    return (await monitorFromPoint(cursor.x, cursor.y)) ?? (await currentMonitor());
  } catch {
    return currentMonitor();
  }
}

function clampRatio(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0.5;
}

function getLogicalWorkArea(monitor: Monitor) {
  const scaleFactor = monitor.scaleFactor || 1;
  return {
    height: monitor.workArea.size.height / scaleFactor,
    width: monitor.workArea.size.width / scaleFactor,
    x: monitor.workArea.position.x / scaleFactor,
    y: monitor.workArea.position.y / scaleFactor,
  };
}

function getMonitorPositionSnapshot(monitor: Monitor): Pick<
  TodayStepHandlePosition,
  "monitorName" | "monitorX" | "monitorY"
> {
  return {
    monitorName: monitor.name ?? undefined,
    monitorX: monitor.position.x,
    monitorY: monitor.position.y,
  };
}

function isSameMonitor(position: TodayStepHandlePosition, monitor: Monitor) {
  if (position.monitorName && monitor.name === position.monitorName) {
    return true;
  }

  if (typeof position.monitorX !== "number" || typeof position.monitorY !== "number") {
    return false;
  }

  return (
    Math.abs(monitor.position.x - position.monitorX) <= MONITOR_MATCH_TOLERANCE &&
    Math.abs(monitor.position.y - position.monitorY) <= MONITOR_MATCH_TOLERANCE
  );
}

async function resolveMonitorForHandlePosition(
  position?: TodayStepHandlePosition,
): Promise<Monitor | null> {
  if (!position?.monitorName && typeof position?.monitorX !== "number") {
    return null;
  }

  try {
    const { availableMonitors } = await import("@tauri-apps/api/window");
    const monitors = await availableMonitors();
    return monitors.find((monitor) => isSameMonitor(position, monitor)) ?? null;
  } catch {
    return null;
  }
}

async function resolveWindowMonitor(
  window: TauriWindow | null,
  size: { height: number; width: number },
): Promise<Monitor | null> {
  const { currentMonitor, monitorFromPoint } = await import("@tauri-apps/api/window");
  if (!window) {
    return currentMonitor();
  }

  try {
    const position = await window.outerPosition();
    const scaleFactor = await window.scaleFactor();
    return (
      (await monitorFromPoint(
        position.x + (size.width * scaleFactor) / 2,
        position.y + (size.height * scaleFactor) / 2,
      )) ?? (await currentMonitor())
    );
  } catch {
    return currentMonitor();
  }
}

async function resolveHandleMonitor(window: TauriWindow): Promise<Monitor | null> {
  const { currentMonitor, monitorFromPoint } = await import("@tauri-apps/api/window");

  try {
    const position = await window.outerPosition();
    const scaleFactor = await window.scaleFactor();
    return (
      (await monitorFromPoint(
        position.x + (TODAY_STEP_HANDLE_SIZE.width * scaleFactor) / 2,
        position.y + (TODAY_STEP_HANDLE_SIZE.height * scaleFactor) / 2,
      )) ?? (await currentMonitor())
    );
  } catch {
    return currentMonitor();
  }
}

export async function showTodayStepWindow({
  docked = false,
  handlePosition = {
    edge: "right",
    yRatio: 0.5,
  },
  pinned = true,
}: TodayStepWindowOptions = {}) {
  if (!isTauriRuntime()) {
    window.location.assign("/today-step");
    return;
  }

  const [{ LogicalPosition, Window }, { emitTo }, { WebviewWindow }] = await Promise.all([
    import("@tauri-apps/api/window"),
    import("@tauri-apps/api/event"),
    import("@tauri-apps/api/webviewWindow"),
  ]);
  const todayStepHandleWindow = await Window.getByLabel("today-step-handle");
  let todayStepWindow = await Window.getByLabel("today-step");
  const handleMonitor = todayStepHandleWindow
    ? await resolveHandleMonitor(todayStepHandleWindow)
    : null;

  if (docked) {
    await setTodayStepDocked(true, pinned, handlePosition);
    return;
  }

  if (!todayStepWindow) {
    new WebviewWindow("today-step", {
      alwaysOnTop: pinned,
      focus: true,
      fullscreen: false,
      height: TODAY_STEP_EXPANDED_SIZE.height,
      minHeight: 520,
      minWidth: 360,
      resizable: true,
      title: "今日",
      titleBarStyle: "overlay",
      trafficLightPosition: new LogicalPosition(12, 12),
      url: "/today-step",
      visibleOnAllWorkspaces: pinned,
      width: TODAY_STEP_EXPANDED_SIZE.width,
    });
    todayStepWindow = await Window.getByLabel("today-step");
  }

  await todayStepHandleWindow?.hide();
  await todayStepWindow?.show();
  await todayStepWindow?.unminimize();
  await applyTodayStepWindowMode(todayStepWindow, { docked, handlePosition, pinned }, handleMonitor);
  await todayStepWindow?.setFocus();
  await emitTo("today-step", TODAY_STEP_REFRESH_EVENT);

  const mainWindow = await Window.getByLabel("main");
  await mainWindow?.minimize();
}
