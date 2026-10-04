import {
  createDeviceTransaction,
  listDeviceTransactions,
} from "../../../core/storage/device-store";
import type { CreateTransactionInput } from "../types/transaction.types";

export class DeviceTransactionRepository {
  async list(userId: number) {
    return listDeviceTransactions(userId);
  }

  async create(input: CreateTransactionInput) {
    return createDeviceTransaction({
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
