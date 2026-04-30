import { demoSnapshot } from "../demo/demoSnapshot";
import { exportSnapshot, type AppSnapshot } from "../export/exportSnapshot";
import { importSnapshot, validateSnapshot } from "../import/importSnapshot";

const LOCAL_SNAPSHOT_ENDPOINT = "/api/local-snapshot";
const LOCAL_SYNC_DEBOUNCE_MS = 450;

let restorePromise: Promise<void> | null = null;
let syncTimeoutId: number | null = null;
let isRestoringLocalSnapshot = false;

function canUseLocalSnapshotSync() {
  return import.meta.env.DEV && import.meta.env.MODE !== "test";
}

function hasSnapshotData(snapshot: AppSnapshot) {
  return (
    snapshot.projects.length > 0 ||
    snapshot.tasks.length > 0 ||
    snapshot.focusRefs.length > 0 ||
    snapshot.reports.length > 0
  );
}

async function readLocalSnapshot() {
  const response = await fetch(LOCAL_SNAPSHOT_ENDPOINT);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Local snapshot read failed (${response.status})`);
  }

  const snapshot = (await response.json()) as unknown;
  return validateSnapshot(snapshot) ? snapshot : null;
}

async function writeLocalSnapshot(snapshot: AppSnapshot) {
  await fetch(LOCAL_SNAPSHOT_ENDPOINT, {
    body: JSON.stringify(snapshot),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
}

export function scheduleLocalSnapshotSync() {
  if (!canUseLocalSnapshotSync() || isRestoringLocalSnapshot) {
    return;
  }

  if (syncTimeoutId !== null) {
    window.clearTimeout(syncTimeoutId);
  }

  syncTimeoutId = window.setTimeout(() => {
    syncTimeoutId = null;
    void exportSnapshot()
      .then(writeLocalSnapshot)
      .catch((error: unknown) => {
        console.warn("Local snapshot sync failed.", error);
      });
  }, LOCAL_SYNC_DEBOUNCE_MS);
}

export function restoreLocalSnapshot() {
  if (!canUseLocalSnapshotSync()) {
    return Promise.resolve();
  }

  restorePromise ??= (async () => {
    const localSnapshot = await readLocalSnapshot();
    const snapshotToRestore = localSnapshot ?? await exportSnapshot();

    isRestoringLocalSnapshot = true;
    try {
      await importSnapshot(hasSnapshotData(snapshotToRestore) ? snapshotToRestore : demoSnapshot);
    } finally {
      isRestoringLocalSnapshot = false;
    }

    if (!localSnapshot) {
      await writeLocalSnapshot(await exportSnapshot());
    }
  })();

  return restorePromise;
}
