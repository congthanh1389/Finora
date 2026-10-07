import { describe, expect, it, vi } from "vitest";
import { BudgetService, type BudgetRepository } from "../service/budget.service";
import type { BudgetSummary } from "../types/budget.types";

const summary = (overrides: Partial<BudgetSummary> = {}): BudgetSummary => ({
  id: 1,
  userId: 1,
  categoryId: 10,
  walletId: null,
  amount: 5000000,
  currency: "VND",
  periodStart: new Date("2026-10-01T00:00:00.000Z"),
  periodEnd: new Date("2026-11-01T00:00:00.000Z"),
  createdAt: new Date("2026-10-01T00:00:00.000Z"),
  updatedAt: new Date("2026-10-01T00:00:00.000Z"),
  categoryName: "Ăn uống",
  walletName: null,
  spent: 1000000,
  remaining: 4000000,
  progress: 0.2,
  ...overrides,
});

function createRepository(items: BudgetSummary[] = []): BudgetRepository {
  return {
    listByPeriod: vi.fn().mockResolvedValue(items),
    create: vi.fn().mockImplementation(async (input) => summary({
      userId: input.userId,
      categoryId: input.categoryId,
      walletId: input.walletId ?? null,
      amount: input.amount,
      currency: input.currency ?? "VND",
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    })),
    update: vi.fn().mockResolvedValue(summary()),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe("BudgetService", () => {
  it("rejects invalid users and amounts", async () => {
    const repository = createRepository();
    const service = new BudgetService(repository);
    const period = service.getMonthPeriod(new Date("2026-10-07T00:00:00.000Z"));

    await expect(service.listCurrentMonth(0)).rejects.toThrow("Invalid user id");
    await expect(service.createBudget({
      userId: 1,
      categoryId: 10,
      amount: 0,
      periodStart: period.start,
      periodEnd: period.end,
    })).rejects.toThrow("Số tiền ngân sách phải là số nguyên dương.");
  });

  it("prevents duplicate category and wallet budgets in the same period", async () => {
    const period = {
      start: new Date("2026-10-01T00:00:00.000Z"),
      end: new Date("2026-11-01T00:00:00.000Z"),
    };
    const repository = createRepository([summary({ categoryId: 10, walletId: null })]);
    const service = new BudgetService(repository);

    await expect(service.createBudget({
      userId: 1,
      categoryId: 10,
      walletId: null,
      amount: 5000000,
      periodStart: period.start,
      periodEnd: period.end,
    })).rejects.toThrow("Ngân sách cho danh mục và ví này đã tồn tại.");
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("creates a valid monthly budget", async () => {
    const repository = createRepository();
    const service = new BudgetService(repository);
    const period = service.getMonthPeriod(new Date("2026-10-07T00:00:00.000Z"));

    await expect(service.createBudget({
      userId: 1,
      categoryId: 10,
      walletId: 2,
      amount: 3000000,
      periodStart: period.start,
      periodEnd: period.end,
    })).resolves.toMatchObject({ categoryId: 10, walletId: 2, amount: 3000000, currency: "VND" });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it("delegates update and delete", async () => {
    const repository = createRepository();
    const service = new BudgetService(repository);

    await service.updateBudget(1, 1, { amount: 4000000 });
    await service.deleteBudget(1, 1);

    expect(repository.update).toHaveBeenCalledWith(1, 1, { amount: 4000000 });
    expect(repository.delete).toHaveBeenCalledWith(1, 1);
  });
});
