import type { Transaction } from "../../../../drizzle/schema";

export type TransactionType = Transaction["type"];

export type CreateTransactionInput = {
  userId: number;
  type: TransactionType;
  amount: number;
  walletId?: number | null;
  sourceWalletId?: number | null;
  destinationWalletId?: number | null;
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
