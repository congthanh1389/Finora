import type { ReportData } from "../repository/device-report.repository";

export type ReportPeriod = "current" | "previous" | "year";

export interface IReportRepository {
  getCurrentMonth(userId: number, now?: Date): Promise<ReportData>;
  getReport(
    userId: number,
    from: Date,
    to: Date,
    previousFrom: Date,
    previousTo: Date,
  ): Promise<ReportData>;
}

export class ReportService {
  constructor(private readonly repository: IReportRepository) {}

  async getReport(userId: number, period: ReportPeriod, now = new Date()): Promise<ReportData> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid user id");
    }

    if (period === "current") {
      return this.repository.getCurrentMonth(userId, now);
    }

    if (period === "previous") {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return this.repository.getReport(userId, from, to, previousFrom, from);
    }

    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear() + 1, 0, 1);
    const previousFrom = new Date(now.getFullYear() - 1, 0, 1);
    return this.repository.getReport(userId, from, to, previousFrom, from);
  }
}
