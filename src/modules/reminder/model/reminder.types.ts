export type ReminderType = "budget" | "cash_flow" | "trend" | "wallet";

export type ReminderSeverity = "warning" | "info";

export type Reminder = {
  id: string;
  type: ReminderType;
  severity: ReminderSeverity;
  priority: number;
  title: string;
  description: string;
};

export type ReminderInput = {
  income: number;
  expense: number;
  previousExpense: number;
  budgets: {
    budgetId: number;
    categoryName: string;
    percentageUsed: number;
    isOverBudget: boolean;
    spent: number;
    limit: number;
  }[];
  wallets: {
    walletId: number;
    name: string;
    balance: number;
  }[];
};

export type ReminderEngineOptions = {
  limit?: number;
};
