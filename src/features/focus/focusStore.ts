import { create } from "zustand";
import { queueLocalSnapshotSync } from "../../lib/localPersistence/localSnapshotApi";
import { focusRepository } from "../../lib/storage/focusRepository";
import type { FocusReference } from "../../types/focus";

type FocusState = {
  addTask: (taskId: string) => Promise<void>;
  focusRefs: FocusReference[];
  isLoaded: boolean;
  loadFocus: () => Promise<FocusReference[]>;
  removeTask: (taskId: string) => Promise<void>;
  reorderTask: (taskId: string, toIndex: number) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
};

function normalizeFocusRefs(focusRefs: FocusReference[]) {
  return focusRefs.map((reference, index) => ({
    ...reference,
    order: index,
  }));
}

export const useFocusStore = create<FocusState>((set, get) => ({
  async addTask(taskId) {
    if (get().focusRefs.some((ref) => ref.taskId === taskId)) {
      return;
    }
    const reference: FocusReference = {
      addedAt: new Date().toISOString(),
      order: get().focusRefs.length,
      taskId,
    };
    await focusRepository.add(reference);
    set({ focusRefs: [...get().focusRefs, reference] });
    queueLocalSnapshotSync();
  },
  focusRefs: [],
  isLoaded: false,
  async loadFocus() {
    const focusRefs = await focusRepository.list();
    set({ focusRefs, isLoaded: true });
    return focusRefs;
  },
  async removeTask(taskId) {
    const nextRefs = normalizeFocusRefs(
      get().focusRefs.filter((ref) => ref.taskId !== taskId),
    );
    await focusRepository.replaceAll(nextRefs);
    set({ focusRefs: nextRefs });
    queueLocalSnapshotSync();
  },
  async reorderTask(taskId, toIndex) {
    const focusRefs = [...get().focusRefs];
    const fromIndex = focusRefs.findIndex((ref) => ref.taskId === taskId);

    if (fromIndex === -1 || fromIndex === toIndex) {
      return;
    }

    const boundedIndex = Math.max(0, Math.min(toIndex, focusRefs.length - 1));
    const [moved] = focusRefs.splice(fromIndex, 1);
    focusRefs.splice(boundedIndex, 0, moved);

    const normalized = normalizeFocusRefs(focusRefs);
    await focusRepository.replaceAll(normalized);
    set({ focusRefs: normalized });
    queueLocalSnapshotSync();
  },
  async toggleTask(taskId) {
    const exists = get().focusRefs.some((ref) => ref.taskId === taskId);
    if (exists) {
      await get().removeTask(taskId);
      return;
    }
    await get().addTask(taskId);
  },
}));
