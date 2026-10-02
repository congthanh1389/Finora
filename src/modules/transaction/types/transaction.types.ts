import type { Transaction } from "../../../../drizzle/schema";

export type TransactionType = Transaction["type"];

export type TransactionView = {
  id: number;
  userId: number;
  accountId: number;
  categoryId: number | null;
  type: TransactionType;
  amount: string;
  transactionDate: Date;
  note: string | null;
  transferAccountId: number | null;
  isVoided: boolean;
  createdAt: Date;
  updatedAt: Date;
};
