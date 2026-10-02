import { describe, expect, it } from "vitest";
import type { Transaction } from "../../../../drizzle/schema";
import { FinancialEngine } from "../financial-engine";

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    userId: 1,
    accountId: 10,
    categoryId: 20,
    type: "expense",
    amount: "100.00",
    transactionDate: new Date("2026-01-01"),
    note: null,
    transferAccountId: null,
    isVoided: 0,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("FinancialEngine", () => {
  const engine = new FinancialEngine();

  it("calculates income minus expense", () => {
    expect(
      engine.getSummary([
        transaction({ type: "income", amount: "1000.00" }),
        transaction({ type: "expense", amount: "300.00" }),
      ]),
    ).toEqual({ income: "1000.00", expense: "300.00", net: "700.00" });
  });

  it("handles transfer for source and destination accounts", () => {
    const transfer = transaction({
      type: "transfer",
      amount: "250.00",
      categoryId: null,
      transferAccountId: 20,
    });

    expect(engine.getTransactionEffect(10, transfer)).toBe("-250.00");
    expect(engine.getTransactionEffect(20, transfer)).toBe("250.00");
  });

  it("ignores voided transactions", () => {
    const voided = transaction({ type: "income", amount: "500.00", isVoided: 1 });
    expect(engine.getSummary([voided])).toEqual({
      income: "0.00",
      expense: "0.00",
      net: "0.00",
    });
  });

  it("preserves exact decimal arithmetic", () => {
    expect(
      engine.getSummary([
        transaction({ type: "income", amount: "0.10" }),
        transaction({ type: "income", amount: "0.20" }),
      ]).net,
    ).toBe("0.30");
  });
});
