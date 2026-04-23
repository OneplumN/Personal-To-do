import { getDatabase } from "./db";
import type { FocusReference } from "../../types/focus";

export const focusRepository = {
  async add(reference: FocusReference) {
    const db = await getDatabase();
    await db.put("focusRefs", reference);
    return reference;
  },

  async clear() {
    const db = await getDatabase();
    await db.clear("focusRefs");
  },

  async list() {
    const db = await getDatabase();
    const refs = await db.getAll("focusRefs");
    return refs.sort((left, right) => left.addedAt.localeCompare(right.addedAt));
  },

  async remove(taskId: string) {
    const db = await getDatabase();
    await db.delete("focusRefs", taskId);
  },
};
