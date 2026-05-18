import { ListTodo } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  setTodayStepDocked,
  snapTodayStepHandleWindow,
  startTodayStepHandleDrag,
  TODAY_STEP_REFRESH_EVENT,
} from "../../lib/desktop/windowCommands";
import { isTauriRuntime } from "../../lib/platform/runtime";
import { useFocusStore } from "../focus/focusStore";
import { usePreferenceStore } from "../preferences/preferenceStore";
import { useTaskStore } from "../tasks/taskStore";

function isActiveFocusTask(taskId: string, taskIds: Set<string>) {
  return taskIds.has(taskId);
}

export function TodayStepHandlePage() {
  const dragMovedRef = useRef(false);
  const dragSnapTimerRef = useRef<number | null>(null);
  const focusRefs = useFocusStore((state) => state.focusRefs);
  const loadFocus = useFocusStore((state) => state.loadFocus);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const tasks = useTaskStore((state) => state.tasks);
  const todayStepHandlePosition = usePreferenceStore(
    (state) => state.preferences.todayStepHandlePosition,
  );
  const todayStepPinned = usePreferenceStore((state) => state.preferences.todayStepPinned);
  const savePreferences = usePreferenceStore((state) => state.savePreferences);
  const refreshTodayStepData = useCallback(async () => {
    await Promise.all([loadTasks(), loadFocus()]);
  }, [loadFocus, loadTasks]);

  useEffect(() => {
    void refreshTodayStepData();
  }, [refreshTodayStepData]);

  useEffect(() => {
    if (!isTauriRuntime()) {
      return undefined;
    }

    let unlistenMoved: (() => void) | undefined;
    void import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      void getCurrentWindow().onMoved(() => {
        dragMovedRef.current = true;
        if (dragSnapTimerRef.current) {
          window.clearTimeout(dragSnapTimerRef.current);
        }
        dragSnapTimerRef.current = window.setTimeout(() => {
          void snapTodayStepHandleWindow().then((position) => {
            if (position) {
              void savePreferences({ todayStepHandlePosition: position });
            }
          });
        }, 260);
      }).then((unlisten) => {
        unlistenMoved = unlisten;
      });
    });

    return () => {
      unlistenMoved?.();
      if (dragSnapTimerRef.current) {
        window.clearTimeout(dragSnapTimerRef.current);
      }
    };
  }, [savePreferences]);

  useEffect(() => {
    if (!isTauriRuntime()) {
      return undefined;
    }

    let unlistenRefresh: (() => void) | undefined;
    void import("@tauri-apps/api/event").then(({ listen }) => {
      void listen(TODAY_STEP_REFRESH_EVENT, () => {
        void refreshTodayStepData();
      }).then((unlisten) => {
        unlistenRefresh = unlisten;
      });
    });

    return () => {
      unlistenRefresh?.();
    };
  }, [refreshTodayStepData]);

  const activeTaskIds = useMemo(
    () => new Set(tasks.filter((task) => task.status !== "done").map((task) => task.id)),
    [tasks],
  );
  const focusCount = useMemo(
    () =>
      focusRefs.filter((reference) =>
        isActiveFocusTask(reference.taskId, activeTaskIds),
      ).length,
    [activeTaskIds, focusRefs],
  );

  async function expandTodayStep() {
    await setTodayStepDocked(false, todayStepPinned, todayStepHandlePosition);
    await savePreferences({ todayStepDocked: false });
  }

  async function dragHandle() {
    dragMovedRef.current = false;
    await startTodayStepHandleDrag();
  }

  return (
    <main className="today-step-handle-shell">
      <button
        aria-label="展开今日执行"
        className={`today-step-edge-handle today-step-edge-handle--${todayStepHandlePosition.edge}`}
        onClick={() => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }
          void expandTodayStep();
        }}
        onPointerDown={() => {
          void dragHandle();
        }}
        title="展开今日执行"
        type="button"
      >
        <span className="today-step-edge-handle__mark" aria-hidden="true">
          <ListTodo aria-hidden="true" strokeWidth={2} />
        </span>
        <span className="today-step-edge-handle__label">今日</span>
        <strong title={`${todayStepHandlePosition.edge} edge`} aria-label={`${focusCount} 个焦点任务`}>{focusCount}</strong>
        <span className="today-step-edge-handle__grip" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
    </main>
  );
}
