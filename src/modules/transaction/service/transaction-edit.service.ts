import type { Transaction } from "../../../../drizzle/schema";
import {
  deleteDeviceTransaction,
  getDeviceTransaction,
  updateDeviceTransaction,
  type UpdateTransactionInput,
} from "../repository/device-transaction-edit.repository";

export class TransactionEditService {
  async getTransaction(userId: number, transactionId: number) {
    return getDeviceTransaction(userId, transactionId);
  }

  async updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    if (!Number.isInteger(input.userId) || input.userId <= 0) throw new Error("Người dùng không hợp lệ.");
    if (!Number.isInteger(input.transactionId) || input.transactionId <= 0) throw new Error("Giao dịch không hợp lệ.");
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error("Vui lòng nhập số tiền hợp lệ.");
    if (!Number.isInteger(input.walletId) || input.walletId <= 0) throw new Error("Vui lòng chọn ví.");
    if (!Number.isInteger(input.categoryId) || input.categoryId <= 0) throw new Error("Vui lòng chọn danh mục.");

    return updateDeviceTransaction({
      ...input,
      note: input.note?.trim() || null,
    });
  }

  async deleteTransaction(userId: number, transactionId: number): Promise<Transaction> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Người dùng không hợp lệ.");
    if (!Number.isInteger(transactionId) || transactionId <= 0) throw new Error("Giao dịch không hợp lệ.");

    return deleteDeviceTransaction(userId, transactionId);
  }
}
