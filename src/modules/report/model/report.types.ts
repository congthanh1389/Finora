export type ReportPeriod = "week" | "month" | "quarter" | "year";

export type ReportPeriodRange = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
};

export type ReportSummary = {
  income: number;
  expense: number;
  transfer: number;
  incomeCount: number;
  expenseCount: number;
  balance: number;
  savingsRate: number;
};

export type ReportCategory = {
  categoryId: number | null;
  name: string;
  amount: number;
  percentage: number;
};

export type ReportWallet = {
  walletId: number;
  name: string;
  amount: number;
  percentage: number;
};

export type ReportCashFlowPoint = {
  date: string;
  income: number;
  expense: number;
  net: number;
};

export type ReportComparison = {
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
};

export type ReportSnapshot = {
  periodStart: string;
  periodEnd: string;
  summary: ReportSummary;
  previous: ReportSummary;
  comparison: ReportComparison;
  categories: ReportCategory[];
  wallets: ReportWallet[];
  cashFlow: ReportCashFlowPoint[];
};
