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
    return refs.sort((left, right) => {
      if (left.order !== undefined && right.order !== undefined) {
        return left.order - right.order;
      }
      return left.addedAt.localeCompare(right.addedAt);
    });
  },

  async remove(taskId: string) {
    const db = await getDatabase();
    await db.delete("focusRefs", taskId);
  },

  async replaceAll(references: FocusReference[]) {
    const db = await getDatabase();
    const transaction = db.transaction("focusRefs", "readwrite");
    await transaction.store.clear();
    for (const reference of references) {
      await transaction.store.put(reference);
    }
    await transaction.done;
    return references;
  },
};
