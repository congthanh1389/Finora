import {
  createDeviceTransaction,
  getDeviceDatabase,
  initializeDeviceStorage,
  listDeviceTransactions,
} from "../../../core/storage/device-store";
import type { Transaction } from "../../../../drizzle/schema";
import type { CreateTransactionInput, TransactionHistoryFilters, TransactionType } from "../types/transaction.types";

const HISTORY_PAGE_SIZE = 50;
const TRANSACTION_SELECT_COLUMNS = `id, user_id, type, amount, currency, wallet_id, source_wallet_id, destination_wallet_id, category_id, note, occurred_at, created_at, updated_at`;

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
      `SELECT ${TRANSACTION_SELECT_COLUMNS} FROM transactions
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
    filters?: TransactionHistoryFilters,
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
    if (filters?.walletId !== undefined && (!Number.isSafeInteger(filters.walletId) || filters.walletId <= 0)) {
      throw new Error("Invalid wallet filter.");
    }
    if (filters?.categoryId !== undefined && (!Number.isSafeInteger(filters.categoryId) || filters.categoryId <= 0)) {
      throw new Error("Invalid category filter.");
    }
    if (filters?.minAmount !== undefined && (!Number.isSafeInteger(filters.minAmount) || filters.minAmount < 0)) {
      throw new Error("Invalid minimum amount filter.");
    }
    if (filters?.maxAmount !== undefined && (!Number.isSafeInteger(filters.maxAmount) || filters.maxAmount < 0)) {
      throw new Error("Invalid maximum amount filter.");
    }
    if (filters?.minAmount !== undefined && filters?.maxAmount !== undefined && filters.minAmount > filters.maxAmount) {
      throw new Error("Invalid amount range.");
    }

    await initializeDeviceStorage();

    const conditions = ["t.user_id = ?"];
    const params: unknown[] = [userId];

    if (type !== "all") {
      conditions.push("t.type = ?");
      params.push(type);
    }
    if (start && end) {
      conditions.push("t.occurred_at >= ?", "t.occurred_at < ?");
      params.push(start.toISOString(), end.toISOString());
    }
    if (filters?.walletId !== undefined) {
      conditions.push("(t.wallet_id = ? OR t.source_wallet_id = ? OR t.destination_wallet_id = ?)");
      params.push(filters.walletId, filters.walletId, filters.walletId);
    }
    if (filters?.categoryId !== undefined) {
      conditions.push("t.category_id = ?");
      params.push(filters.categoryId);
    }
    if (filters?.minAmount !== undefined) {
      conditions.push("t.amount >= ?");
      params.push(filters.minAmount);
    }
    if (filters?.maxAmount !== undefined) {
      conditions.push("t.amount <= ?");
      params.push(filters.maxAmount);
    }
    if (filters?.search?.trim()) {
      const search = filters.search.trim();
      conditions.push(`(
        INSTR(LOWER(COALESCE(t.note, '')), LOWER(?)) > 0
        OR INSTR(LOWER(COALESCE(w.name, '')), LOWER(?)) > 0
        OR INSTR(LOWER(COALESCE(sw.name, '')), LOWER(?)) > 0
        OR INSTR(LOWER(COALESCE(dw.name, '')), LOWER(?)) > 0
        OR INSTR(LOWER(COALESCE(c.name, '')), LOWER(?)) > 0
      )`);
      params.push(search, search, search, search, search);
    }

    const db = await getDeviceDatabase();
    const rows = await db.getAllAsync(
      `SELECT ${TRANSACTION_SELECT_COLUMNS.replaceAll("id,", "t.id,").replaceAll("user_id,", "t.user_id,").replaceAll("type,", "t.type,").replaceAll("amount,", "t.amount,").replaceAll("currency,", "t.currency,").replaceAll("wallet_id,", "t.wallet_id,").replaceAll("source_wallet_id,", "t.source_wallet_id,").replaceAll("destination_wallet_id,", "t.destination_wallet_id,").replaceAll("category_id,", "t.category_id,").replaceAll("note,", "t.note,").replaceAll("occurred_at,", "t.occurred_at,").replaceAll("created_at,", "t.created_at,").replaceAll("updated_at", "t.updated_at")} 
       FROM transactions t
       LEFT JOIN wallets w ON w.id = t.wallet_id AND w.user_id = t.user_id
       LEFT JOIN wallets sw ON sw.id = t.source_wallet_id AND sw.user_id = t.user_id
       LEFT JOIN wallets dw ON dw.id = t.destination_wallet_id AND dw.user_id = t.user_id
       LEFT JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY t.occurred_at DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      ...params,
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
