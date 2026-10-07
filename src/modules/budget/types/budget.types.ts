import type { Budget } from "../../../../drizzle/schema";

export type BudgetSummary = Budget & {
  categoryName: string | null;
  walletName: string | null;
  spent: number;
  remaining: number;
  progress: number;
};

export type CreateBudgetInput = {
  userId: number;
  categoryId: number;
  walletId?: number | null;
  amount: number;
  currency?: string;
  periodStart: Date;
  periodEnd: Date;
};

export type UpdateBudgetInput = {
  categoryId?: number;
  walletId?: number | null;
  amount?: number;
};
