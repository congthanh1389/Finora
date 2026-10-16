import { describe, expect, it } from "vitest";
import { buildSuggestions } from "../engine/suggestion-engine";
import type { SuggestionInput } from "../model/suggestion.types";

function createInput(overrides: Partial<SuggestionInput> = {}): SuggestionInput {
  return {
    income: 10_000_000,
    expense: 6_000_000,
    previousIncome: 10_000_000,
    previousExpense: 5_000_000,
    savingsRate: 40,
    previousSavingsRate: 50,
    categories: [
      { categoryId: 1, name: "Ăn uống", amount: 2_000_000, percentage: 33.3 },
    ],
    budgets: [],
    wallets: [
      { walletId: 1, name: "Ví tiền mặt", expense: 3_000_000, balance: 7_000_000 },
    ],
    ...overrides,
  };
}

describe("SuggestionEngine", () => {
  it("creates a warning when expense increases by at least 20%", () => {
    const result = buildSuggestions(createInput());

    expect(result.some((item) => item.id === "expense-trend-up")).toBe(true);
  });

  it("does not invent a percentage when previous expense is zero", () => {
    const result = buildSuggestions(
      createInput({ expense: 2_000_000, previousExpense: 0 }),
    );

    expect(result.some((item) => item.id === "expense-trend-up")).toBe(false);
  });

  it("prioritizes an over-budget warning", () => {
    const result = buildSuggestions(
      createInput({
        budgets: [
          {
            budgetId: 7,
            categoryName: "Ăn uống",
            limit: 1_000_000,
            spent: 1_200_000,
            percentageUsed: 120,
            isOverBudget: true,
          },
        ],
      }),
    );

    expect(result[0]?.id).toBe("budget-over-7");
  });

  it("shows a positive cash-flow suggestion when savings rate is healthy", () => {
    const result = buildSuggestions(createInput({ savingsRate: 30 }));

    expect(result.some((item) => item.id === "cash-flow-positive")).toBe(true);
  });

  it("limits and sorts suggestions by priority", () => {
    const result = buildSuggestions(
      createInput({
        expense: 12_000_000,
        previousExpense: 5_000_000,
        budgets: [
          {
            budgetId: 1,
            categoryName: "Ăn uống",
            limit: 1_000_000,
            spent: 1_500_000,
            percentageUsed: 150,
            isOverBudget: true,
          },
          {
            budgetId: 2,
            categoryName: "Mua sắm",
            limit: 2_000_000,
            spent: 2_400_000,
            percentageUsed: 120,
            isOverBudget: true,
          },
        ],
      }),
      { limit: 3 },
    );

    expect(result).toHaveLength(3);
    expect(result[0]?.priority).toBeGreaterThanOrEqual(result[1]?.priority ?? 0);
    expect(result[1]?.priority).toBeGreaterThanOrEqual(result[2]?.priority ?? 0);
  });
});
