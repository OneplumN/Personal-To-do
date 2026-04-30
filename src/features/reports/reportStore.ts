import { create } from "zustand";
import { queueLocalSnapshotSync } from "../../lib/localPersistence/localSnapshotApi";
import { reportRepository } from "../../lib/storage/reportRepository";
import type { SavedReport } from "../../types/report";

type ReportState = {
  isLoaded: boolean;
  loadReports: () => Promise<SavedReport[]>;
  reports: SavedReport[];
  saveReport: (report: SavedReport) => Promise<SavedReport>;
  updateReport: (
    reportId: string,
    update: Partial<Pick<SavedReport, "draft" | "polishedContent" | "title">>,
  ) => Promise<SavedReport | null>;
};

export const useReportStore = create<ReportState>((set, get) => ({
  isLoaded: false,
  async loadReports() {
    const reports = await reportRepository.list();
    set({ isLoaded: true, reports });
    return reports;
  },
  reports: [],
  async saveReport(report) {
    await reportRepository.save(report);
    const existing = get().reports.find((item) => item.id === report.id);
    set({
      reports: existing
        ? get().reports.map((item) => (item.id === report.id ? report : item))
        : [report, ...get().reports],
    });
    queueLocalSnapshotSync();
    return report;
  },
  async updateReport(reportId, update) {
    const current = get().reports.find((report) => report.id === reportId);
    if (!current) {
      return null;
    }
    const nextReport: SavedReport = {
      ...current,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    await reportRepository.save(nextReport);
    set({
      reports: get().reports.map((report) =>
        report.id === reportId ? nextReport : report,
      ),
    });
    queueLocalSnapshotSync();
    return nextReport;
  },
}));
