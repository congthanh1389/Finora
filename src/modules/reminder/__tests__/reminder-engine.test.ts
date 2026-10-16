import { describe, expect, it } from "vitest";
import { buildReminders } from "../engine/reminder-engine";
import type { ReminderInput } from "../model/reminder.types";

const baseInput: ReminderInput = {
  income: 10_000_000,
  expense: 8_000_000,
  previousExpense: 7_000_000,
  budgets: [],
  wallets: [],
};

describe("reminder engine", () => {
  it("prioritizes over-budget reminders", () => {
    const reminders = buildReminders({
      ...baseInput,
      budgets: [
        {
          budgetId: 1,
          categoryName: "Ăn uống",
          percentageUsed: 120,
          isOverBudget: true,
          spent: 1_200_000,
          limit: 1_000_000,
        },
      ],
      income: 1_000_000,
      expense: 2_000_000,
    });

    expect(reminders[0]?.id).toBe("budget-over-1");
  });

  it("warns when cash flow is negative", () => {
    const reminders = buildReminders({
      ...baseInput,
      income: 5_000_000,
      expense: 6_000_000,
      previousExpense: 6_000_000,
    });

    expect(reminders.some((item) => item.id === "cash-flow-negative")).toBe(true);
  });

  it("does not show expense trend when previous expense is zero", () => {
    const reminders = buildReminders({
      ...baseInput,
      expense: 5_000_000,
      previousExpense: 0,
    });

    expect(reminders.some((item) => item.type === "trend")).toBe(false);
  });

  it("warns for negative wallet balance", () => {
    const reminders = buildReminders({
      ...baseInput,
      wallets: [{ walletId: 2, name: "Ví chính", balance: -50_000 }],
    });

    expect(reminders[0]?.id).toBe("wallet-negative-2");
  });

  it("limits reminders", () => {
    const reminders = buildReminders({
      ...baseInput,
      income: 1_000_000,
      expense: 2_000_000,
      budgets: [
        { budgetId: 1, categoryName: "Ăn uống", percentageUsed: 130, isOverBudget: true, spent: 1_300_000, limit: 1_000_000 },
        { budgetId: 2, categoryName: "Mua sắm", percentageUsed: 120, isOverBudget: true, spent: 1_200_000, limit: 1_000_000 },
      ],
      wallets: [{ walletId: 3, name: "Ví phụ", balance: -10_000 }],
    }, { limit: 2 });

    expect(reminders).toHaveLength(2);
  });
});
