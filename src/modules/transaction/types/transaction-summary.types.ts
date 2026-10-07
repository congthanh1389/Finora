import type { TransactionType } from "./transaction.types";

export type TransactionSummaryFilter = "all" | TransactionType;

export type TransactionSummaryTotals = {
  totalAmount: number;
  transactionCount: number;
  incomeAmount: number;
  incomeCount: number;
  expenseAmount: number;
  expenseCount: number;
  transferAmount: number;
  transferCount: number;
  netCashflow: number;
};

export type TransactionSummaryPeriod = {
  start: Date;
  end: Date;
};

export type TransactionSummaryResult = {
  period: TransactionSummaryPeriod;
  filter: TransactionSummaryFilter;
  totals: TransactionSummaryTotals;
};