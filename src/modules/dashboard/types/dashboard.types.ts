import type { Account, Category, Transaction } from "../../../../drizzle/schema";

export type DashboardPeriod = {
  from: Date;
  to: Date;
};

export type DashboardSummary = {
  totalBalance: string;
  income: string;
  expense: string;
  netCashFlow: string;
};

export type DashboardAccountBalance = {
  accountId: number;
  name: string;
  type: Account["type"];
  currency: string;
  balance: string;
};

export type DashboardRecentTransaction = {
  id: number;
  type: Transaction["type"];
  amount: string;
  transactionDate: Date;
  note: string | null;
  accountName: string;
  categoryName: string | null;
};

export type DashboardCategoryExpense = {
  categoryId: number;
  categoryName: string;
  amount: string;
};

export type DashboardData = {
  period: DashboardPeriod;
  summary: DashboardSummary;
  accounts: DashboardAccountBalance[];
  recentTransactions: DashboardRecentTransaction[];
  expenseByCategory: DashboardCategoryExpense[];
};
