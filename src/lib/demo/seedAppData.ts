import { demoSnapshot } from "./demoSnapshot";
import { getDatabase } from "../storage/db";

export async function seedAppData() {
  const db = await getDatabase();
  const transaction = db.transaction(
    ["projects", "tasks", "focusRefs", "reports", "preferences"],
    "readwrite",
  );

  await Promise.all([
    transaction.objectStore("projects").clear(),
    transaction.objectStore("tasks").clear(),
    transaction.objectStore("focusRefs").clear(),
    transaction.objectStore("reports").clear(),
    transaction.objectStore("preferences").clear(),
  ]);

  for (const project of demoSnapshot.projects) {
    await transaction.objectStore("projects").put(project);
  }
  for (const task of demoSnapshot.tasks) {
    await transaction.objectStore("tasks").put(task);
  }
  for (const focusRef of demoSnapshot.focusRefs) {
    await transaction.objectStore("focusRefs").put(focusRef);
  }
  for (const report of demoSnapshot.reports) {
    await transaction.objectStore("reports").put(report);
  }
  await transaction.objectStore("preferences").put(demoSnapshot.preferences);

  await transaction.done;
  return demoSnapshot;
}
