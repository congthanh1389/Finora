import { describe, expect, it, vi } from "vitest";

import type { Account, Category, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import { DashboardService } from "../service/dashboard.service";

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    userId: 7,
    name: "Tiền mặt",
    type: "cash",
    currency: "VND",
    openingBalance: "1000.00",
    isArchived: 0,
    createdAt: new Date("2026-10-01T00:00:00Z"),
    updatedAt: new Date("2026-10-01T00:00:00Z"),
    ...overrides,
  };
}

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    userId: 7,
    accountId: 1,
    categoryId: 1,
    type: "income",
    amount: "200.00",
    transactionDate: new Date("2026-10-05T12:00:00Z"),
    note: null,
    transferAccountId: null,
    isVoided: 0,
    createdAt: new Date("2026-10-05T12:00:00Z"),
    updatedAt: new Date("2026-10-05T12:00:00Z"),
    ...overrides,
  };
}

function repository(
  accounts: Account[],
  allTransactions: Transaction[],
  categories: Category[],
): IFinoraRepository {
  return {
    listAccounts: vi.fn().mockResolvedValue(accounts),
    getAccount: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    archiveAccount: vi.fn(),
    listCategories: vi.fn().mockResolvedValue(categories),
    getCategory: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    listTransactions: vi.fn().mockImplementation(async (_userId, filter) => {
      return allTransactions.filter((item) => {
        if (filter?.from && item.transactionDate < filter.from) return false;
        if (filter?.to && item.transactionDate > filter.to) return false;
        if (filter?.accountId && item.accountId !== filter.accountId) return false;
        if (filter?.categoryId && item.categoryId !== filter.categoryId) return false;
        if (filter?.type && item.type !== filter.type) return false;
        return item.isVoided === 0;
      });
    }),
    getTransaction: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  };
}

const categories: Category[] = [{
  id: 1,
  userId: 7,
  name: "Lương",
  type: "income",
  parentId: null,
  icon: null,
  isSystem: 0,
  isArchived: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}];

describe("DashboardService", () => {
  it("uses FinancialEngine for balance and period summary", async () => {
    const repo = repository(
      [account()],
      [
        transaction(),
        transaction({ id: 2, type: "expense", categoryId: null, amount: "50.00" }),
        transaction({ id: 3, type: "transfer", categoryId: null, amount: "100.00", transferAccountId: 2 }),
        transaction({ id: 4, isVoided: 1, amount: "9999.00" }),
      ],
      categories,
    );

    const dashboard = await new DashboardService(repo).getDashboard(7, {
      from: new Date("2026-10-01T00:00:00Z"),
      to: new Date("2026-10-31T23:59:59Z"),
    });

    expect(dashboard.summary).toEqual({
      totalBalance: "1150.00",
      income: "200.00",
      expense: "50.00",
      netCashFlow: "150.00",
    });
    expect(dashboard.accounts[0].balance).toBe("1150.00");
    expect(dashboard.expenseByCategory).toEqual([]);
    expect(dashboard.recentTransactions).toHaveLength(3);
  });

  it("excludes archived accounts from total balance", async () => {
    const repo = repository(
      [account(), account({ id: 2, name: "Ví cũ", openingBalance: "5000.00", isArchived: 1 })],
      [],
      [],
    );

    const dashboard = await new DashboardService(repo).getDashboard(7, {
      from: new Date("2026-10-01T00:00:00Z"),
      to: new Date("2026-10-31T23:59:59Z"),
    });

    expect(dashboard.summary.totalBalance).toBe("1000.00");
    expect(dashboard.accounts).toHaveLength(1);
  });

  it("groups valid expenses by category with exact decimal arithmetic", async () => {
    const repo = repository(
      [account()],
      [
        transaction({ type: "expense", categoryId: 2, amount: "0.10" }),
        transaction({ id: 2, type: "expense", categoryId: 2, amount: "0.20" }),
      ],
      categories,
    );

    const dashboard = await new DashboardService(repo).getDashboard(7, {
      from: new Date("2026-10-01T00:00:00Z"),
      to: new Date("2026-10-31T23:59:59Z"),
    });

    expect(dashboard.expenseByCategory).toEqual([
      { categoryId: 2, categoryName: "Danh mục khác", amount: "0.30" },
    ]);
  });
});
