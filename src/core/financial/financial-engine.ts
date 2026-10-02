import type { Transaction } from "../../../drizzle/schema";
import type {
  FinancialEffect,
  FinancialEngineInput,
  FinancialSummary,
} from "./types/financial.types";

function toMinorUnits(value: string | number): bigint {
  const normalized = String(value).trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  if (!/^\d+$/.test(wholePart) || !/^\d*$/.test(fractionPart)) {
    throw new Error(`Invalid monetary value: ${normalized}`);
  }
  const minor = BigInt(wholePart) * 100n + BigInt((fractionPart + "00").slice(0, 2));
  return negative ? -minor : minor;
}

function formatMinorUnits(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  return `${negative ? "-" : ""}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

function validTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((transaction) => transaction.isVoided === 0);
}

export class FinancialEngine {
  getEffects(input: FinancialEngineInput): FinancialEffect[] {
    const effects: FinancialEffect[] = [];

    for (const transaction of validTransactions(input.transactions)) {
      const amount = toMinorUnits(transaction.amount);
      if (input.accountId !== undefined) {
        if (transaction.type === "income" && transaction.accountId === input.accountId) {
          effects.push({ accountId: input.accountId, amount: formatMinorUnits(amount) });
        } else if (transaction.type === "expense" && transaction.accountId === input.accountId) {
          effects.push({ accountId: input.accountId, amount: formatMinorUnits(-amount) });
        } else if (transaction.type === "transfer") {
          if (transaction.accountId === input.accountId) {
            effects.push({ accountId: input.accountId, amount: formatMinorUnits(-amount) });
          }
          if (transaction.transferAccountId === input.accountId) {
            effects.push({ accountId: input.accountId, amount: formatMinorUnits(amount) });
          }
        }
      }
    }

    return effects;
  }

  getNetEffect(input: FinancialEngineInput): string {
    return formatMinorUnits(
      this.getEffects(input).reduce((total, effect) => total + toMinorUnits(effect.amount), 0n),
    );
  }

  getSummary(transactions: Transaction[]): FinancialSummary {
    let income = 0n;
    let expense = 0n;

    for (const transaction of validTransactions(transactions)) {
      const amount = toMinorUnits(transaction.amount);
      if (transaction.type === "income") income += amount;
      if (transaction.type === "expense") expense += amount;
    }

    return {
      income: formatMinorUnits(income),
      expense: formatMinorUnits(expense),
      net: formatMinorUnits(income - expense),
    };
  }

  getTransactionEffect(accountId: number, transaction: Transaction): string {
    return this.getNetEffect({ transactions: [transaction], accountId });
  }
}
