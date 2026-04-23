import { getDatabase } from "./db";
import type { SavedReport } from "../../types/report";

export const reportRepository = {
  async delete(reportId: string) {
    const db = await getDatabase();
    await db.delete("reports", reportId);
  },

  async get(reportId: string) {
    const db = await getDatabase();
    return db.get("reports", reportId);
  },

  async list() {
    const db = await getDatabase();
    const reports = await db.getAll("reports");
    return reports.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  async save(report: SavedReport) {
    const db = await getDatabase();
    await db.put("reports", report);
    return report;
  },
};
