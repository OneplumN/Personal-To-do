import { exportSnapshot } from "../export/exportSnapshot";
import { scheduleLocalSnapshotSync } from "./localSnapshotSync";

export async function persistLocalSnapshotNow() {
  if (!import.meta.env.DEV || import.meta.env.MODE === "test") {
    return;
  }

  await fetch("/api/local-snapshot", {
    body: JSON.stringify(await exportSnapshot()),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
}

export function queueLocalSnapshotSync() {
  scheduleLocalSnapshotSync();
}
