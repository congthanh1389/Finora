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
  const id = Number(row.id);
  const userId = Number(row.user_id);
  const amount = Number(row.amount);
  const walletId = row.wallet_id == null ? null : Number(row.wallet_id);
  const sourceWalletId = row.source_wallet_id == null ? null : Number(row.source_wallet_id);
  const destinationWalletId = row.destination_wallet_id == null ? null : Number(row.destination_wallet_id);
  const categoryId = row.category_id == null ? null : Number(row.category_id);
  const occurredAt = new Date(row.occurred_at);
  const createdAt = new Date(row.created_at);
  const updatedAt = new Date(row.updated_at);

  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid persisted transaction id.");
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid persisted transaction user id.");
  if (row.type !== "income" && row.type !== "expense" && row.type !== "transfer") throw new Error("Invalid persisted transaction type.");
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Invalid persisted transaction amount.");
  if (typeof row.currency !== "string" || !/^[A-Z]{3}$/.test(row.currency)) throw new Error("Invalid persisted transaction currency.");
  if (walletId != null && (!Number.isSafeInteger(walletId) || walletId <= 0)) throw new Error("Invalid persisted transaction wallet id.");
  if (sourceWalletId != null && (!Number.isSafeInteger(sourceWalletId) || sourceWalletId <= 0)) throw new Error("Invalid persisted transaction source wallet id.");
  if (destinationWalletId != null && (!Number.isSafeInteger(destinationWalletId) || destinationWalletId <= 0)) throw new Error("Invalid persisted transaction destination wallet id.");
  if (categoryId != null && (!Number.isSafeInteger(categoryId) || categoryId <= 0)) throw new Error("Invalid persisted transaction category id.");
  if (row.note != null && typeof row.note !== "string") throw new Error("Invalid persisted transaction note.");
  if (row.type === "transfer") {
    if (walletId != null || categoryId != null || sourceWalletId == null || destinationWalletId == null || sourceWalletId === destinationWalletId) {
      throw new Error("Invalid persisted transfer references.");
    }
  } else if (walletId == null || sourceWalletId != null || destinationWalletId != null) {
    throw new Error("Invalid persisted transaction wallet references.");
  }
  if (Number.isNaN(occurredAt.getTime()) || Number.isNaN(createdAt.getTime()) || Number.isNaN(updatedAt.getTime())) {
    throw new Error("Invalid persisted transaction date.");
  }

  return {
    id,
    userId,
    type: row.type,
    amount,
    currency: row.currency,
    walletId,
    sourceWalletId,
    destinationWalletId,
    categoryId,
    note: row.note == null ? null : row.note,
    occurredAt,
    createdAt,
    updatedAt,
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
