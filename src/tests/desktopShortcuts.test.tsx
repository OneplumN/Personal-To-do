import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDesktopShortcuts } from "../lib/desktop/useDesktopShortcuts";

function ShortcutHarness({
  onNew,
  onOpenSettings,
  onOpenTodayStep,
  todayStepShortcut = "Alt+Space",
}: {
  onNew: () => void;
  onOpenSettings: () => void;
  onOpenTodayStep: () => void;
  todayStepShortcut?: string;
}) {
  useDesktopShortcuts({ onNew, onOpenSettings, onOpenTodayStep, todayStepShortcut });
  return <input aria-label="Editable" />;
}

describe("desktop shortcuts", () => {
  test("ignores shortcuts outside the Tauri runtime", () => {
    const onNew = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenTodayStep = vi.fn();

    render(
      <ShortcutHarness
        onNew={onNew}
        onOpenTodayStep={onOpenTodayStep}
        onOpenSettings={onOpenSettings}
      />,
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: ",", metaKey: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", metaKey: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: " " }));

    expect(onOpenSettings).not.toHaveBeenCalled();
    expect(onNew).not.toHaveBeenCalled();
    expect(onOpenTodayStep).not.toHaveBeenCalled();
  });

  test("handles desktop shortcuts in the Tauri runtime", () => {
    const onNew = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenTodayStep = vi.fn();
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });

    render(
      <ShortcutHarness
        onNew={onNew}
        onOpenTodayStep={onOpenTodayStep}
        onOpenSettings={onOpenSettings}
      />,
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: ",", metaKey: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: " " }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onNew).toHaveBeenCalledTimes(1);
    expect(onOpenTodayStep).toHaveBeenCalledTimes(1);

    Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
  });

  test("uses a custom today step shortcut", () => {
    const onNew = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenTodayStep = vi.fn();
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });

    render(
      <ShortcutHarness
        onNew={onNew}
        onOpenTodayStep={onOpenTodayStep}
        onOpenSettings={onOpenSettings}
        todayStepShortcut="Ctrl+Shift+K"
      />,
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: " " }));
    window.dispatchEvent(
      new KeyboardEvent("keydown", { ctrlKey: true, key: "k", shiftKey: true }),
    );

    expect(onOpenTodayStep).toHaveBeenCalledTimes(1);

    Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
  });
});
