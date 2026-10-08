import { describe, expect, it, vi } from "vitest";
import type { ReportPeriodRange } from "../../model/report.types";
import { getCustomReportPeriodRange, getReportPeriodRange, ReportService } from "../report.service";

const repository = {
  getReport: vi.fn(),
};

const rawReport = {
  periodStart: "2026-10-01T00:00:00.000Z",
  periodEnd: "2026-11-01T00:00:00.000Z",
  income: 10000000,
  expense: 4000000,
  transfer: 1000000,
  incomeCount: 3,
  expenseCount: 8,
  previousIncome: 8000000,
  previousExpense: 5000000,
  previousTransfer: 500000,
  previousIncomeCount: 2,
  previousExpenseCount: 9,
  categories: [
    { categoryId: 1, name: "Ăn uống", amount: 2500000 },
    { categoryId: null, name: "Khác", amount: 1500000 },
  ],
  wallets: [
    { walletId: 1, name: "Tiền mặt", amount: 2500000, balance: 5500000 },
    { walletId: 2, name: "Ngân hàng", amount: 1500000, balance: 12500000 },
  ],
  cashFlow: [
    { date: "2026-10-01", income: 1000000, expense: 300000 },
    { date: "2026-10-02", income: 0, expense: 700000 },
  ],
  budgets: [
    { budgetId: 1, categoryId: 1, categoryName: "Ăn uống", limit: 3000000, spent: 2500000 },
  ],
};

describe("ReportService", () => {
  it("builds summary, percentages, comparison and cash flow", async () => {
    repository.getReport.mockResolvedValue(rawReport);
    const service = new ReportService(repository);

    const result = await service.getReport(
      1,
      "month",
      new Date(2026, 9, 8, 12, 0, 0),
    );

    expect(result.summary.balance).toBe(6000000);
    expect(result.summary.savingsRate).toBe(60);
    expect(result.comparison.expenseChange).toBe(-20);
    expect(result.categories[0].percentage).toBe(62.5);
    expect(result.wallets[0].percentage).toBe(62.5);
    expect(result.wallets[0].balance).toBe(5500000);
    expect(result.cashFlow[1].net).toBe(-700000);
  });

  it("rejects invalid user ids", async () => {
    const service = new ReportService(repository);

    await expect(service.getReport(0, "month")).rejects.toThrow("Invalid user id");
    await expect(service.getReport(Number.MAX_SAFE_INTEGER + 1, "month")).rejects.toThrow(
      "Invalid user id",
    );
  });

  it("builds calendar-aligned period ranges", () => {
    const now = new Date(2026, 9, 8, 12, 0, 0);

    const week = getReportPeriodRange("week", now);
    const month = getReportPeriodRange("month", now);
    const quarter = getReportPeriodRange("quarter", now);
    const year = getReportPeriodRange("year", now);

    expect(week.start).toEqual(new Date(2026, 9, 5));
    expect(week.end).toEqual(new Date(2026, 9, 12));
    expect(month.start).toEqual(new Date(2026, 9, 1));
    expect(month.end).toEqual(new Date(2026, 10, 1));
    expect(quarter.start).toEqual(new Date(2026, 9, 1));
    expect(quarter.end).toEqual(new Date(2027, 0, 1));
    expect(year.start).toEqual(new Date(2026, 0, 1));
    expect(year.end).toEqual(new Date(2027, 0, 1));
  });

  it("builds custom inclusive date ranges with matching previous periods", () => {
    const range = getCustomReportPeriodRange({
      start: new Date(2026, 9, 10, 18, 30),
      end: new Date(2026, 9, 12, 23, 59),
    });

    expect(range.start).toEqual(new Date(2026, 9, 10));
    expect(range.end).toEqual(new Date(2026, 9, 13));
    expect(range.previousStart).toEqual(new Date(2026, 9, 7));
    expect(range.previousEnd).toEqual(new Date(2026, 9, 10));
  });

  it("passes the calculated custom range to the repository", async () => {
    repository.getReport.mockResolvedValue(rawReport);
    const service = new ReportService(repository);

    await service.getReport(
      1,
      "custom",
      new Date(2026, 9, 20),
      {
        start: new Date(2026, 9, 10),
        end: new Date(2026, 9, 12),
      },
    );

    const range = repository.getReport.mock.calls.at(-1)?.[1] as ReportPeriodRange;
    expect(range.start).toEqual(new Date(2026, 9, 10));
    expect(range.end).toEqual(new Date(2026, 9, 13));
    expect(range.previousStart).toEqual(new Date(2026, 9, 7));
    expect(range.previousEnd).toEqual(new Date(2026, 9, 10));
  });

  it("rejects a custom range without an end date", async () => {
    const service = new ReportService(repository);

    await expect(
      service.getReport(
        1,
        "custom",
        new Date(2026, 9, 20),
        { start: new Date(2026, 9, 10), end: null },
      ),
    ).rejects.toThrow("Custom report end date is required.");
  });

  it("passes the calculated range to the repository", async () => {
    repository.getReport.mockResolvedValue(rawReport);
    const service = new ReportService(repository);

    await service.getReport(1, "quarter", new Date(2026, 9, 8));

    const range = repository.getReport.mock.calls.at(-1)?.[1] as ReportPeriodRange;
    expect(range.start).toEqual(new Date(2026, 9, 1));
    expect(range.previousStart).toEqual(new Date(2026, 6, 1));
  });
});
