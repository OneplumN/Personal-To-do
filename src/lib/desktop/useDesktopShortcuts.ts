import { useEffect } from "react";
import { isTauriRuntime } from "../platform/runtime";
import { doesKeyboardEventMatchShortcut } from "./shortcutKeys";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

export function useDesktopShortcuts({
  onNew,
  onOpenSettings,
  onOpenTodayStep,
  todayStepShortcut,
}: {
  onNew: () => void;
  onOpenSettings: () => void;
  onOpenTodayStep: () => void;
  todayStepShortcut: string;
}) {
  useEffect(() => {
    if (!isTauriRuntime()) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        !isEditableTarget(event.target) &&
        doesKeyboardEventMatchShortcut(event, todayStepShortcut)
      ) {
        event.preventDefault();
        onOpenTodayStep();
        return;
      }

      const hasPrimaryModifier = event.metaKey || event.ctrlKey;
      if (!hasPrimaryModifier) {
        return;
      }

      if (event.key === ",") {
        event.preventDefault();
        onOpenSettings();
        return;
      }

      if (event.key.toLowerCase() === "n" && !isEditableTarget(event.target)) {
        event.preventDefault();
        onNew();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNew, onOpenTodayStep, onOpenSettings, todayStepShortcut]);
}
