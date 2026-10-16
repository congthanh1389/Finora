export type ReportPeriod = "today" | "week" | "month" | "quarter" | "year" | "custom";

export type ReportCustomRange = {
  start: Date;
  end: Date | null;
};

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
  balance: number;
  type: string;
  currency: string;
};

export type ReportCashFlowPoint = {
  date: string;
  income: number;
  expense: number;
  net: number;
};

export type ReportComparison = {
  incomeChange: number | null;
  expenseChange: number | null;
  balanceChange: number | null;
};

export type ReportBudget = {
  budgetId: number;
  categoryId: number;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  walletId: number | null;
  walletName: string | null;
  walletType: string | null;
  currency: string;
};

export type ReportInsight = {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
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
  budgets: ReportBudget[];
  insights: ReportInsight[];
};
