import type { Transaction } from "../../../../drizzle/schema";

export type TransactionType = Transaction["type"];

export type CreateTransactionInput = {
  userId: number;
  type: Exclude<TransactionType, "transfer">;
  amount: number;
  walletId: number;
  categoryId?: number | null;
  note?: string | null;
  occurredAt?: Date;
};

export type TransactionSummary = {
  id: number;
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: number | null;
  categoryId: number | null;
  note: string | null;
  occurredAt: Date;
};
