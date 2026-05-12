import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauriRuntime } from "../platform/runtime";

export type DesktopFileSaveResult = "canceled" | "saved" | "unsupported";
export type DesktopFileOpenResult =
  | { status: "canceled" | "unsupported" }
  | { contents: string; status: "opened" };

export async function saveTextFile({
  contents,
  defaultPath,
}: {
  contents: string;
  defaultPath: string;
}): Promise<DesktopFileSaveResult> {
  if (!isTauriRuntime()) {
    return "unsupported";
  }

  const filePath = await save({
    defaultPath,
    filters: [{ extensions: ["json"], name: "JSON" }],
  });

  if (!filePath) {
    return "canceled";
  }

  await writeTextFile(filePath, contents);
  const savedContents = await readTextFile(filePath);
  if (savedContents !== contents) {
    throw new Error("导出校验失败，请重新选择保存位置");
  }
  return "saved";
}

export async function openTextFile(): Promise<DesktopFileOpenResult> {
  if (!isTauriRuntime()) {
    return { status: "unsupported" };
  }

  const filePath = await open({
    directory: false,
    filters: [{ extensions: ["json"], name: "JSON" }],
    multiple: false,
  });

  if (!filePath || Array.isArray(filePath)) {
    return { status: "canceled" };
  }

  return {
    contents: await readTextFile(filePath),
    status: "opened",
  };
}
