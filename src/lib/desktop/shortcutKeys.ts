const MODIFIER_LABELS = ["Ctrl", "Alt", "Shift", "Meta"] as const;

type ModifierLabel = (typeof MODIFIER_LABELS)[number];

function normalizeKey(key: string) {
  if (key === " ") {
    return "Space";
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key;
}

function isModifierOnly(key: string) {
  return ["Alt", "Control", "Meta", "Shift"].includes(key);
}

export function formatKeyboardShortcut(event: KeyboardEvent | React.KeyboardEvent) {
  if (isModifierOnly(event.key)) {
    return "";
  }

  const modifiers: ModifierLabel[] = [];
  if (event.ctrlKey) {
    modifiers.push("Ctrl");
  }
  if (event.altKey) {
    modifiers.push("Alt");
  }
  if (event.shiftKey) {
    modifiers.push("Shift");
  }
  if (event.metaKey) {
    modifiers.push("Meta");
  }

  if (modifiers.length === 0) {
    return "";
  }

  return [...modifiers, normalizeKey(event.key)].join("+");
}

export function doesKeyboardEventMatchShortcut(
  event: KeyboardEvent,
  shortcut: string | undefined,
) {
  const normalizedShortcut = shortcut?.trim();
  if (!normalizedShortcut) {
    return false;
  }

  return formatKeyboardShortcut(event).toLowerCase() === normalizedShortcut.toLowerCase();
}
