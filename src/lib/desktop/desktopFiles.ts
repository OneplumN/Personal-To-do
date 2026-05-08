import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauriRuntime } from "../platform/runtime";

export async function saveTextFile({
  contents,
  defaultPath,
}: {
  contents: string;
  defaultPath: string;
}) {
  if (!isTauriRuntime()) {
    return false;
  }

  const filePath = await save({
    defaultPath,
    filters: [{ extensions: ["json"], name: "JSON" }],
  });

  if (!filePath) {
    return true;
  }

  await writeTextFile(filePath, contents);
  return true;
}

export async function openTextFile() {
  if (!isTauriRuntime()) {
    return null;
  }

  const filePath = await open({
    directory: false,
    filters: [{ extensions: ["json"], name: "JSON" }],
    multiple: false,
  });

  if (!filePath || Array.isArray(filePath)) {
    return "";
  }

  return readTextFile(filePath);
}
