export type SuggestionType = "cash_flow" | "trend" | "category" | "budget" | "wallet";
export type SuggestionSeverity = "positive" | "info" | "warning";

export type Suggestion = {
  id: string;
  type: SuggestionType;
  severity: SuggestionSeverity;
  priority: number;
  title: string;
  description: string;
};

export type SuggestionInput = {
  income: number;
  expense: number;
  previousIncome: number;
  previousExpense: number;
  savingsRate: number;
  previousSavingsRate: number;
  categories: Array<{
    categoryId: number | null;
    name: string;
    amount: number;
    percentage: number;
  }>;
  budgets: Array<{
    budgetId: number;
    categoryName: string;
    limit: number;
    spent: number;
    percentageUsed: number;
    isOverBudget: boolean;
  }>;
  wallets: Array<{
    walletId: number;
    name: string;
    amount: number;
    balance: number;
  }>;
};

export type SuggestionEngineOptions = {
  limit?: number;
};
