import type {
  TransactionSummaryFilter,
  TransactionSummaryResult,
} from "../types/transaction-summary.types";

export interface TransactionSummaryRepository {
  getSummary(
    userId: number,
    start: Date,
    end: Date,
    filter?: TransactionSummaryFilter,
  ): Promise<TransactionSummaryResult>;
}

export class TransactionSummaryService {
  constructor(private readonly repository: TransactionSummaryRepository) {}

  async getSummary(
    userId: number,
    start: Date,
    end: Date,
    filter: TransactionSummaryFilter = "all",
  ) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!(start instanceof Date) || Number.isNaN(start.getTime())) throw new Error("Invalid start date");
    if (!(end instanceof Date) || Number.isNaN(end.getTime())) throw new Error("Invalid end date");
    if (start >= end) throw new Error("Khoảng thời gian không hợp lệ.");

    if (!["all", "income", "expense", "transfer"].includes(filter)) {
      throw new Error("Invalid transaction filter");
    }

    return this.repository.getSummary(userId, start, end, filter);
  }

  static currentMonth(now = new Date()) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }

  static daysAgo(days: number, now = new Date()) {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  static year(now = new Date()) {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear() + 1, 0, 1),
    };
  }
}