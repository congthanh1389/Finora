import {
  createDeviceTransaction,
  getDeviceDatabase,
  initializeDeviceStorage,
  listDeviceTransactions,
} from "../../../core/storage/device-store";
import type { Transaction } from "../../../../drizzle/schema";
import type { CreateTransactionInput, TransactionType } from "../types/transaction.types";

const HISTORY_PAGE_SIZE = 50;

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

export class DeviceTransactionRepository {
  async list(userId: number) {
    return listDeviceTransactions(userId);
  }

  async listRecent(userId: number, limit = 20) {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new Error("Invalid user ID.");
    }
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new Error("Invalid transaction limit.");
    }
    const safeLimit = limit;
    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM transactions
       WHERE user_id = ?
       ORDER BY occurred_at DESC, id DESC
       LIMIT ?`,
      userId,
      safeLimit,
    );
    return rows.map(transactionFromRow);
  }

  async listHistoryPage(
    userId: number,
    offset: number,
    type: "all" | TransactionType = "all",
    limit = HISTORY_PAGE_SIZE,
    start?: Date,
    end?: Date,
  ): Promise<{ transactions: Transaction[]; hasMore: boolean }> {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new Error("Invalid user ID.");
    }
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error("Invalid transaction offset.");
    }
    if (type !== "all" && type !== "income" && type !== "expense" && type !== "transfer") {
      throw new Error("Invalid transaction type.");
    }
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new Error("Invalid transaction limit.");
    }
    if ((start !== undefined && !(start instanceof Date)) || (end !== undefined && !(end instanceof Date))) {
      throw new Error("Invalid transaction period.");
    }
    if ((start !== undefined && Number.isNaN(start.getTime())) || (end !== undefined && Number.isNaN(end.getTime()))) {
      throw new Error("Invalid transaction period.");
    }
    if ((start === undefined) !== (end === undefined)) {
      throw new Error("Invalid transaction period.");
    }
    if (start !== undefined && end !== undefined && start >= end) {
      throw new Error("Invalid transaction period.");
    }

    await initializeDeviceStorage();
    const db = await getDeviceDatabase();
    const periodClause = start && end ? " AND occurred_at >= ? AND occurred_at < ?" : "";
    const periodParams = start && end ? [start.toISOString(), end.toISOString()] : [];
    const rows = type === "all"
      ? await db.getAllAsync(
          `SELECT * FROM transactions
           WHERE user_id = ?${periodClause}
           ORDER BY occurred_at DESC, id DESC
           LIMIT ? OFFSET ?`,
          userId,
          ...periodParams,
          limit + 1,
          offset,
        )
      : await db.getAllAsync(
          `SELECT * FROM transactions
           WHERE user_id = ? AND type = ?${periodClause}
           ORDER BY occurred_at DESC, id DESC
           LIMIT ? OFFSET ?`,
          userId,
          type,
          ...periodParams,
          limit + 1,
          offset,
        );

    const hasMore = rows.length > limit;
    return {
      transactions: rows.slice(0, limit).map(transactionFromRow),
      hasMore,
    };
  }

  async create(input: CreateTransactionInput) {
    if (!Number.isSafeInteger(input.userId) || input.userId <= 0) {
      throw new Error("Invalid user ID.");
    }
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
