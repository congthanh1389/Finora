import type { Transaction } from "../../../../drizzle/schema";

export type FinancialEffect = {
  accountId: number;
  amount: string;
};

export type FinancialSummary = {
  income: string;
  expense: string;
  net: string;
};

export type FinancialEngineInput = {
  transactions: Transaction[];
  accountId?: number;
};
