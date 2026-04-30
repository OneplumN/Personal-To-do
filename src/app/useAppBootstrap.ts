import { useEffect, useRef } from "react";
import { useFocusStore } from "../features/focus/focusStore";
import { usePreferenceStore } from "../features/preferences/preferenceStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { restoreLocalSnapshot } from "../lib/localPersistence/localSnapshotSync";

export function useAppBootstrap() {
  const isProjectsLoaded = useProjectStore((state) => state.isLoaded);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const isTasksLoaded = useTaskStore((state) => state.isLoaded);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const isFocusLoaded = useFocusStore((state) => state.isLoaded);
  const loadFocus = useFocusStore((state) => state.loadFocus);
  const isReportsLoaded = useReportStore((state) => state.isLoaded);
  const loadReports = useReportStore((state) => state.loadReports);
  const isPreferencesLoaded = usePreferenceStore((state) => state.isLoaded);
  const loadPreferences = usePreferenceStore((state) => state.loadPreferences);
  const bootstrapStartedRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
      if (bootstrapStartedRef.current) {
        return;
      }

      bootstrapStartedRef.current = true;

      void (async () => {
        await restoreLocalSnapshot();
        await Promise.all([
          loadProjects(),
          loadTasks(),
          loadFocus(),
          loadReports(),
          loadPreferences(),
        ]);
      })();
      return;
    }

    if (!isProjectsLoaded) {
      void loadProjects();
    }
    if (!isTasksLoaded) {
      void loadTasks();
    }
    if (!isFocusLoaded) {
      void loadFocus();
    }
    if (!isReportsLoaded) {
      void loadReports();
    }
    if (!isPreferencesLoaded) {
      void loadPreferences();
    }
  }, [
    isFocusLoaded,
    isPreferencesLoaded,
    isProjectsLoaded,
    isReportsLoaded,
    isTasksLoaded,
    loadFocus,
    loadPreferences,
    loadProjects,
    loadReports,
    loadTasks,
  ]);

  return {
    ready:
      isProjectsLoaded &&
      isTasksLoaded &&
      isFocusLoaded &&
      isReportsLoaded &&
      isPreferencesLoaded,
  };
}
