import { createLocalTransaction, listLocalTransactions } from "../../../../server/local-store";
import type { CreateTransactionInput, TransactionSummary } from "../types/transaction.types";

export class TransactionRepository {
  async list(userId: number): Promise<TransactionSummary[]> {
    return listLocalTransactions(userId);
  }

  async create(input: CreateTransactionInput): Promise<TransactionSummary> {
    return createLocalTransaction({
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      currency: "VND",
      walletId: input.walletId,
      sourceWalletId: null,
      destinationWalletId: null,
      categoryId: input.categoryId ?? null,
      note: input.note ?? null,
      occurredAt: input.occurredAt ?? new Date(),
    });
  }
}
