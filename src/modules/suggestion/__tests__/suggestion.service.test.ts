import { describe, expect, it } from "vitest";
import { SuggestionService } from "../service/suggestion.service";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";

function createSnapshot(overrides: Partial<ReportSnapshot> = {}): ReportSnapshot {
  return {
    periodStart: "2026-10-01T00:00:00.000Z",
    periodEnd: "2026-11-01T00:00:00.000Z",
    summary: {
      income: 10_000_000,
      expense: 6_000_000,
      transfer: 0,
      incomeCount: 2,
      expenseCount: 5,
      balance: 4_000_000,
      savingsRate: 40,
    },
    previous: {
      income: 10_000_000,
      expense: 5_000_000,
      transfer: 0,
      incomeCount: 2,
      expenseCount: 4,
      balance: 5_000_000,
      savingsRate: 50,
    },
    comparison: {
      incomeChange: 0,
      expenseChange: 20,
      balanceChange: -20,
    },
    categories: [
      { categoryId: 1, name: "Ăn uống", amount: 2_000_000, percentage: 33.3 },
    ],
    wallets: [
      {
        walletId: 1,
        name: "Ví tiền mặt",
        amount: 3_000_000,
        percentage: 50,
        balance: 7_000_000,
        type: "cash",
        currency: "VND",
      },
    ],
    cashFlow: [],
    budgets: [],
    insights: [],
    ...overrides,
  };
}

describe("SuggestionService", () => {
  it("maps report wallet spending into wallet suggestion input", () => {
    const result = new SuggestionService().getSuggestions(createSnapshot());

    expect(result.some((item) => item.id === "wallet-top-1")).toBe(true);
  });

  it("returns no suggestions for an empty financial period", () => {
    const result = new SuggestionService().getSuggestions(
      createSnapshot({
        summary: {
          income: 0,
          expense: 0,
          transfer: 0,
          incomeCount: 0,
          expenseCount: 0,
          balance: 0,
          savingsRate: 0,
        },
        previous: {
          income: 0,
          expense: 0,
          transfer: 0,
          incomeCount: 0,
          expenseCount: 0,
          balance: 0,
          savingsRate: 0,
        },
        comparison: {
          incomeChange: null,
          expenseChange: null,
          balanceChange: null,
        },
        categories: [],
        wallets: [],
        budgets: [],
      }),
    );

    expect(result).toEqual([]);
  });
});
