import {
  createDeviceTransaction,
  listDeviceTransactions,
} from "../../../core/storage/device-store";
import type { CreateTransactionInput, TransactionSummary } from "../types/transaction.types";

export class TransactionRepository {
  async list(userId: number): Promise<TransactionSummary[]> {
    return listDeviceTransactions(userId);
  }

  async create(input: CreateTransactionInput): Promise<TransactionSummary> {
    return createDeviceTransaction({
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      currency: "VND",
      walletId: input.walletId ?? null,
      sourceWalletId: input.sourceWalletId ?? null,
      destinationWalletId: input.destinationWalletId ?? null,
      categoryId: input.categoryId ?? null,
      note: input.note ?? null,
      occurredAt: input.occurredAt ?? new Date(),
    });
  }
}
