import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDesktopShortcuts } from "../lib/desktop/useDesktopShortcuts";

function ShortcutHarness({
  onNew,
  onOpenSettings,
}: {
  onNew: () => void;
  onOpenSettings: () => void;
}) {
  useDesktopShortcuts({ onNew, onOpenSettings });
  return <input aria-label="Editable" />;
}

describe("desktop shortcuts", () => {
  test("ignores shortcuts outside the Tauri runtime", () => {
    const onNew = vi.fn();
    const onOpenSettings = vi.fn();

    render(<ShortcutHarness onNew={onNew} onOpenSettings={onOpenSettings} />);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: ",", metaKey: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", metaKey: true }));

    expect(onOpenSettings).not.toHaveBeenCalled();
    expect(onNew).not.toHaveBeenCalled();
  });

  test("handles desktop shortcuts in the Tauri runtime", () => {
    const onNew = vi.fn();
    const onOpenSettings = vi.fn();
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });

    render(<ShortcutHarness onNew={onNew} onOpenSettings={onOpenSettings} />);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: ",", metaKey: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", ctrlKey: true }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onNew).toHaveBeenCalledTimes(1);

    Reflect.deleteProperty(window, "__TAURI_INTERNALS__");
  });
});
