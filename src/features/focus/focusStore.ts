import { create } from "zustand";
import { focusRepository } from "../../lib/storage/focusRepository";
import type { FocusReference } from "../../types/focus";

type FocusState = {
  addTask: (taskId: string) => Promise<void>;
  focusRefs: FocusReference[];
  isLoaded: boolean;
  loadFocus: () => Promise<FocusReference[]>;
  removeTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
};

export const useFocusStore = create<FocusState>((set, get) => ({
  async addTask(taskId) {
    if (get().focusRefs.some((ref) => ref.taskId === taskId)) {
      return;
    }
    const reference: FocusReference = {
      addedAt: new Date().toISOString(),
      taskId,
    };
    await focusRepository.add(reference);
    set({ focusRefs: [...get().focusRefs, reference] });
  },
  focusRefs: [],
  isLoaded: false,
  async loadFocus() {
    const focusRefs = await focusRepository.list();
    set({ focusRefs, isLoaded: true });
    return focusRefs;
  },
  async removeTask(taskId) {
    await focusRepository.remove(taskId);
    set({ focusRefs: get().focusRefs.filter((ref) => ref.taskId !== taskId) });
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
