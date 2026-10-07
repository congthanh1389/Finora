import { describe, expect, it, vi } from "vitest";
import { TransactionSummaryService } from "../service/transaction-summary.service";
import type { TransactionSummaryResult } from "../types/transaction-summary.types";

function result(): TransactionSummaryResult {
  return {
    period: { start: new Date("2026-10-01T00:00:00Z"), end: new Date("2026-11-01T00:00:00Z") },
    filter: "all",
    totals: {
      totalAmount: 3000000,
      transactionCount: 3,
      incomeAmount: 5000000,
      incomeCount: 1,
      expenseAmount: 2000000,
      expenseCount: 1,
      transferAmount: 1000000,
      transferCount: 1,
      netCashflow: 3000000,
    },
  };
}

describe("TransactionSummaryService", () => {
  it("rejects invalid period", async () => {
    const repository = { getSummary: vi.fn() };
    const service = new TransactionSummaryService(repository);
    await expect(service.getSummary(1, new Date("2026-11-01"), new Date("2026-10-01"))).rejects.toThrow("Khoảng thời gian không hợp lệ.");
  });

  it("delegates summary with selected filter", async () => {
    const repository = { getSummary: vi.fn().mockResolvedValue(result()) };
    const service = new TransactionSummaryService(repository);
    const start = new Date("2026-10-01");
    const end = new Date("2026-11-01");
    const data = await service.getSummary(1, start, end, "expense");
    expect(repository.getSummary).toHaveBeenCalledWith(1, start, end, "expense");
    expect(data.totals.netCashflow).toBe(3000000);
  });

  it("builds the current month period", () => {
    const period = TransactionSummaryService.currentMonth(new Date("2026-10-07T12:00:00"));
    expect(period.start.getMonth()).toBe(9);
    expect(period.end.getMonth()).toBe(10);
  });
});
