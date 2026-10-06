import { DeviceEventEmitter } from "react-native";
import {
  getDeviceDatabase,
  getDeviceWalletBalanceFromDatabase,
  initializeDeviceStorage,
} from "../../../core/storage/device-store";

import type { Transaction } from "../../../../drizzle/schema";

const DEVICE_TRANSACTIONS_CHANGED_EVENT = "finora:transactions-changed";

function transactionFromRow(row: any): Transaction {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    type: row.type,
    amount: Number(row.amount),
    currency: String(row.currency),
    walletId: row.wallet_id == null ? null : Number(row.wallet_id),
    sourceWalletId: row.source_wallet_id == null ? null : Number(row.source_wallet_id),
    destinationWalletId: row.destination_wallet_id == null ? null : Number(row.destination_wallet_id),
    categoryId: row.category_id == null ? null : Number(row.category_id),
    note: row.note == null ? null : String(row.note),
    occurredAt: new Date(row.occurred_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export type UpdateTransactionInput = {
  userId: number;
  transactionId: number;
  amount: number;
  walletId: number;
  categoryId: number;
  note: string | null;
};

export async function getDeviceTransaction(
  userId: number,
  transactionId: number,
): Promise<Transaction | undefined> {
  await initializeDeviceStorage();
  const db = await getDeviceDatabase();
  const row = await db.getFirstAsync(
    "SELECT * FROM transactions WHERE user_id = ? AND id = ?",
    userId,
    transactionId,
  );
  return row ? transactionFromRow(row) : undefined;
}

export async function deleteDeviceTransaction(userId: number, transactionId: number): Promise<Transaction> {
  await initializeDeviceStorage();
  const db = await getDeviceDatabase();
  let deleted: Transaction | undefined;

  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync(
      "SELECT * FROM transactions WHERE user_id = ? AND id = ?",
      userId,
      transactionId,
    );
    if (!row) throw new Error("Không tìm thấy giao dịch.");

    const current = transactionFromRow(row);
    deleted = current;

    await db.runAsync(
      "DELETE FROM transactions WHERE user_id = ? AND id = ?",
      userId,
      transactionId,
    );
  });

  DeviceEventEmitter.emit(DEVICE_TRANSACTIONS_CHANGED_EVENT, deleted!);
  return deleted!;
}

export async function updateDeviceTransaction(input: UpdateTransactionInput): Promise<Transaction> {
  await initializeDeviceStorage();
  const db = await getDeviceDatabase();
  let updated: Transaction | undefined;

  await db.withTransactionAsync(async () => {
    const currentRow = await db.getFirstAsync(
      "SELECT * FROM transactions WHERE user_id = ? AND id = ?",
      input.userId,
      input.transactionId,
    );
    if (!currentRow) throw new Error("Không tìm thấy giao dịch.");

    const current = transactionFromRow(currentRow);
    if (current.type === "transfer") {
      throw new Error("Chưa hỗ trợ sửa giao dịch chuyển tiền.");
    }

    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw new Error("Vui lòng nhập số tiền hợp lệ.");
    }

    const category = await db.getFirstAsync<{ id: number; type: string; is_archived: number }>(
      "SELECT id, type, is_archived FROM categories WHERE user_id = ? AND id = ?",
      input.userId,
      input.categoryId,
    );
    if (!category || Number(category.is_archived) === 1) throw new Error("Danh mục không còn hoạt động.");
    if (category.type !== current.type) throw new Error("Danh mục không phù hợp với loại giao dịch.");

    const newWallet = await db.getFirstAsync<{ id: number; currency: string; allow_negative: number; is_archived: number }>(
      "SELECT id, currency, allow_negative, is_archived FROM wallets WHERE user_id = ? AND id = ?",
      input.userId,
      input.walletId,
    );
    if (!newWallet) throw new Error("Không tìm thấy ví.");
    if (Number(newWallet.is_archived) === 1) throw new Error("Không thể sử dụng ví đã lưu trữ.");
    if (newWallet.currency !== current.currency) throw new Error("Đơn vị tiền của giao dịch không khớp với ví.");

    if (current.type === "expense" && Number(newWallet.allow_negative) !== 1) {
      let newWalletBalance = await getDeviceWalletBalanceFromDatabase(db, input.userId, input.walletId);
      if (current.walletId === input.walletId) {
        newWalletBalance += current.amount;
      }
      if (newWalletBalance - input.amount < 0) {
        throw new Error("Số dư ví không đủ để thực hiện khoản chi này.");
      }
    }

    const now = new Date();
    await db.runAsync(
      `UPDATE transactions
       SET amount = ?, wallet_id = ?, category_id = ?, note = ?, updated_at = ?
       WHERE user_id = ? AND id = ?`,
      input.amount,
      input.walletId,
      input.categoryId,
      input.note,
      now.toISOString(),
      input.userId,
      input.transactionId,
    );

    const row = await db.getFirstAsync(
      "SELECT * FROM transactions WHERE user_id = ? AND id = ?",
      input.userId,
      input.transactionId,
    );
    updated = transactionFromRow(row);
  });

  DeviceEventEmitter.emit(DEVICE_TRANSACTIONS_CHANGED_EVENT, updated!);
  return updated!;
}
