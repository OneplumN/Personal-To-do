import { getStorageAdapter } from "./getStorageAdapter";
import type { SavedReport } from "../../types/report";

export const reportRepository = {
  async delete(reportId: string) {
    await getStorageAdapter().reports.delete(reportId);
  },

  async get(reportId: string) {
    return getStorageAdapter().reports.get(reportId);
  },

  async list() {
    return getStorageAdapter().reports.list();
  },

  async save(report: SavedReport) {
    return getStorageAdapter().reports.save(report);
  },
};
