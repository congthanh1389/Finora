import type { Transaction, Wallet } from "../../../../drizzle/schema";

export type DashboardPeriodSummary = {
  income: number;
  expense: number;
  transfer: number;
  netCashflow: number;
};

export type DashboardRecentTransaction = Transaction & {
  walletName: string;
  walletType: Wallet["type"] | null;
  categoryName: string | null;
};

export type DashboardData = {
  totalBalance: number;
  currentMonth: DashboardPeriodSummary;
  previousMonth: DashboardPeriodSummary;
  recentTransactions: DashboardRecentTransaction[];
  monthLabel: string;
};
