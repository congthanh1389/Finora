import { DeviceEventEmitter } from "react-native";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import type { Category, Wallet, Transaction } from "../../../drizzle/schema";

const DATABASE_NAME = "finora.db";
const CURRENT_SCHEMA_VERSION = 10;

export const DEVICE_TRANSACTIONS_CHANGED_EVENT = "finora:transactions-changed";

let databasePromise: Promise<SQLiteDatabase> | null = null;
let migrationPromise: Promise<void> | null = null;

export async function getDeviceDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) databasePromise = openDatabaseAsync(DATABASE_NAME);
  return databasePromise;
}

async function migrateDatabase(db: SQLiteDatabase) {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    const versionRow = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
    const version = versionRow?.user_version ?? 0;

    if (version < 1) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS wallets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          currency TEXT NOT NULL DEFAULT 'VND',
          opening_balance INTEGER NOT NULL DEFAULT 0,
          allow_negative INTEGER NOT NULL DEFAULT 0,
          is_archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'VND',
          wallet_id INTEGER,
          source_wallet_id INTEGER,
          destination_wallet_id INTEGER,
          category_id INTEGER,
          note TEXT,
          occurred_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
          FOREIGN KEY (source_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT,
          FOREIGN KEY (destination_wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
        );
        CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id_occurred_at ON transactions(user_id, occurred_at DESC);
        PRAGMA user_version = 1;
      `);
    }
    if (version < 2) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          parent_id INTEGER,
          icon TEXT,
          is_archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_categories_user_id_type ON categories(user_id, type, is_archived);
        PRAGMA user_version = 2;
      `);
    }
    if (version < 3) {
      await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id); PRAGMA user_version = 3;`);
    }
    if (version < 4) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS local_accounts (
          id INTEGER PRIMARY KEY,
          open_id TEXT NOT NULL,
          name TEXT,
          email TEXT NOT NULL,
          login_method TEXT,
          last_signed_in TEXT NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_local_accounts_email ON local_accounts(email);
        PRAGMA user_version = 4;
      `);
    }
    if (version < 5) {
      await db.runAsync(
        `UPDATE categories SET is_archived = 1, updated_at = ?
         WHERE is_archived = 0
           AND ((type = 'expense' AND name IN ('Ăn uống', 'Mua sắm', 'Khác'))
             OR (type = 'income' AND name IN ('Lương', 'Thưởng', 'Kinh doanh', 'Đầu tư', 'Khác')))` ,
        new Date().toISOString(),
      );
      await db.execAsync("PRAGMA user_version = 5;");
    }
    if (version < 6) {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_user_wallet_occurred
          ON transactions(user_id, wallet_id, occurred_at DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_source_occurred
          ON transactions(user_id, source_wallet_id, occurred_at DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_destination_occurred
          ON transactions(user_id, destination_wallet_id, occurred_at DESC);
        PRAGMA user_version = 6;
      `);
    }
    if (version < 7) {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_user_type_occurred
          ON transactions(user_id, type, occurred_at DESC, id DESC);
        CREATE INDEX IF NOT EXISTS idx_wallets_user_archived_created
          ON wallets(user_id, is_archived, created_at DESC);
        PRAGMA user_version = 7;
      `);
    }
    if (version < 8) {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          wallet_id INTEGER,
          amount INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'VND',
          period_start TEXT NOT NULL,
          period_end TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
          FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
        );
        CREATE INDEX IF NOT EXISTS idx_budgets_user_period
          ON budgets(user_id, period_start, period_end);
        CREATE INDEX IF NOT EXISTS idx_budgets_user_category_period
          ON budgets(user_id, category_id, period_start, period_end);
        PRAGMA user_version = 8;
      `);
    }
    if (version < 9) {
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_user_type_category_occurred
          ON transactions(user_id, type, category_id, occurred_at DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_type_category_wallet_occurred
          ON transactions(user_id, type, category_id, wallet_id, occurred_at DESC);
        CREATE INDEX IF NOT EXISTS idx_budgets_user_category_period_wallet
          ON budgets(user_id, category_id, period_start, period_end, wallet_id);
        PRAGMA user_version = 9;
      `);
    }
    if (version < 10) {
      await db.execAsync(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_category_period_wallet
          ON budgets(user_id, category_id, period_start, period_end, wallet_id)
          WHERE wallet_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS uq_budgets_user_category_period_no_wallet
          ON budgets(user_id, category_id, period_start, period_end)
          WHERE wallet_id IS NULL;
        PRAGMA user_version = 10;
      `);
    }
    if (version > CURRENT_SCHEMA_VERSION) throw new Error("Finora database version is newer than this app.");
  })();
  try { await migrationPromise; } catch (error) { migrationPromise = null; throw error; }
}

export async function initializeDeviceStorage() {
  const db = await getDeviceDatabase();
  await migrateDatabase(db);
}

function walletFromRow(row: any): Wallet {
  return { id: Number(row.id), userId: Number(row.user_id), name: String(row.name), type: row.type, currency: String(row.currency), openingBalance: Number(row.opening_balance), allowNegative: Number(row.allow_negative), isArchived: Number(row.is_archived), createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) };
}
function transactionFromRow(row: any): Transaction {
  return { id: Number(row.id), userId: Number(row.user_id), type: row.type, amount: Number(row.amount), currency: String(row.currency), walletId: row.wallet_id == null ? null : Number(row.wallet_id), sourceWalletId: row.source_wallet_id == null ? null : Number(row.source_wallet_id), destinationWalletId: row.destination_wallet_id == null ? null : Number(row.destination_wallet_id), categoryId: row.category_id == null ? null : Number(row.category_id), note: row.note == null ? null : String(row.note), occurredAt: new Date(row.occurred_at), createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) };
}
function categoryFromRow(row: any): Category {
  return { id: Number(row.id), userId: Number(row.user_id), name: String(row.name), type: row.type, parentId: row.parent_id == null ? null : Number(row.parent_id), icon: row.icon == null ? null : String(row.icon), isArchived: Number(row.is_archived), createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) };
}

export async function listDeviceCategories(userId: number, type?: Category["type"]): Promise<Category[]> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const rows = type
    ? await db.getAllAsync(`SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY is_archived ASC, name ASC`, userId, type)
    : await db.getAllAsync(`SELECT * FROM categories WHERE user_id = ? ORDER BY is_archived ASC, type ASC, name ASC`, userId);
  return rows.map(categoryFromRow);
}
export async function createDeviceCategory(input: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
  const db = await getDeviceDatabase(); await migrateDatabase(db); const now = new Date();
  const result = await db.runAsync(`INSERT INTO categories (user_id, name, type, parent_id, icon, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, input.userId, input.name, input.type, input.parentId, input.icon, input.isArchived, now.toISOString(), now.toISOString());
  return { ...input, id: result.lastInsertRowId, createdAt: now, updatedAt: now };
}
export async function updateDeviceCategory(userId: number, categoryId: number, name: string, icon?: string): Promise<Category> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const current = await db.getFirstAsync("SELECT * FROM categories WHERE user_id = ? AND id = ?", userId, categoryId);
  if (!current) throw new Error("Không tìm thấy danh mục."); const trimmed = name.trim(); if (!trimmed) throw new Error("Tên danh mục không được để trống.");
  await db.runAsync(
    "UPDATE categories SET name = ?, icon = ?, updated_at = ? WHERE user_id = ? AND id = ?",
    trimmed,
    icon ?? (current as any).icon ?? "other",
    new Date().toISOString(),
    userId,
    categoryId,
  );
  return categoryFromRow(await db.getFirstAsync("SELECT * FROM categories WHERE user_id = ? AND id = ?", userId, categoryId));
}
export async function archiveDeviceCategory(userId: number, categoryId: number): Promise<Category> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const current = await db.getFirstAsync("SELECT * FROM categories WHERE user_id = ? AND id = ?", userId, categoryId);
  if (!current) throw new Error("Không tìm thấy danh mục.");
  await db.runAsync("UPDATE categories SET is_archived = 1, updated_at = ? WHERE user_id = ? AND id = ?", new Date().toISOString(), userId, categoryId);
  return categoryFromRow(await db.getFirstAsync("SELECT * FROM categories WHERE user_id = ? AND id = ?", userId, categoryId));
}
export async function clearDeviceFinancialData(userId: number): Promise<void> {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id.");
  const db = await getDeviceDatabase();
  await migrateDatabase(db);
  await db.withTransactionAsync(async () => {
    await clearDeviceFinancialDataInTransaction(db, userId);
  });
  await db.execAsync("VACUUM");
}

export async function deleteDeviceUserData(userId: number): Promise<void> {
  const db = await getDeviceDatabase();
  await migrateDatabase(db);
  await db.withTransactionAsync(async () => {
    await clearDeviceFinancialDataInTransaction(db, userId);
    await db.runAsync("DELETE FROM local_accounts WHERE id = ?", userId);
  });
  await db.execAsync("VACUUM");
}

async function clearDeviceFinancialDataInTransaction(db: SQLiteDatabase, userId: number): Promise<void> {
  await db.runAsync("DELETE FROM transactions WHERE user_id = ?", userId);
  await db.runAsync("DELETE FROM budgets WHERE user_id = ?", userId);
  await db.runAsync("DELETE FROM categories WHERE user_id = ?", userId);
  await db.runAsync("DELETE FROM wallets WHERE user_id = ?", userId);
}
export type DeviceLocalAccount = { id: number; openId: string; name: string | null; email: string; loginMethod: string | null; lastSignedIn: Date };
export async function listDeviceLocalAccounts(): Promise<DeviceLocalAccount[]> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const rows = await db.getAllAsync<any>("SELECT id, open_id, name, email, login_method, last_signed_in FROM local_accounts ORDER BY last_signed_in DESC, id ASC");
  return rows.map((row: any) => ({ id: Number(row.id), openId: String(row.open_id), name: row.name == null ? null : String(row.name), email: String(row.email), loginMethod: row.login_method == null ? null : String(row.login_method), lastSignedIn: new Date(row.last_signed_in) }));
}
export async function upsertDeviceLocalAccount(account: DeviceLocalAccount): Promise<void> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  await db.runAsync(`INSERT INTO local_accounts (id, open_id, name, email, login_method, last_signed_in) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET open_id = excluded.open_id, name = excluded.name, email = excluded.email, login_method = excluded.login_method, last_signed_in = excluded.last_signed_in`, account.id, account.openId, account.name, account.email, account.loginMethod, account.lastSignedIn.toISOString());
}
export async function deleteDeviceLocalAccount(userId: number): Promise<void> { const db = await getDeviceDatabase(); await migrateDatabase(db); await db.runAsync("DELETE FROM local_accounts WHERE id = ?", userId); }
export async function listDeviceUserIds(): Promise<number[]> {
  const db = await getDeviceDatabase();
  await migrateDatabase(db);
  const rows = await db.getAllAsync<{ user_id: number }>(
    `SELECT user_id FROM wallets
     UNION
     SELECT user_id FROM transactions
     UNION
     SELECT user_id FROM categories
     ORDER BY user_id ASC`,
  );
  return rows
    .map((row) => Number(row.user_id))
    .filter((id) => Number.isInteger(id) && id > 0);
}
export async function listDeviceWallets(userId: number): Promise<Wallet[]> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const rows = await db.getAllAsync(`SELECT * FROM wallets WHERE user_id = ? ORDER BY is_archived ASC, created_at DESC`, userId); return rows.map(walletFromRow);
}
export async function getDeviceWallet(userId: number, walletId: number): Promise<Wallet | undefined> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const row = await db.getFirstAsync("SELECT * FROM wallets WHERE user_id = ? AND id = ?", userId, walletId); return row ? walletFromRow(row) : undefined;
}
export async function getDeviceWalletWithBalance(userId: number, walletId: number): Promise<(Wallet & { balance: number }) | undefined> {
  const db = await getDeviceDatabase();
  await migrateDatabase(db);
  const row = await db.getFirstAsync(
    `SELECT w.*, w.opening_balance + COALESCE(e.balance_effect, 0) AS balance
     FROM wallets w
     LEFT JOIN (
       SELECT wallet_id, SUM(effect) AS balance_effect
       FROM (
         SELECT wallet_id,
                SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) AS effect
         FROM transactions
         WHERE user_id = ? AND wallet_id = ? AND type IN ('income', 'expense')
         GROUP BY wallet_id
         UNION ALL
         SELECT source_wallet_id AS wallet_id,
                SUM(-amount) AS effect
         FROM transactions
         WHERE user_id = ? AND source_wallet_id = ? AND type = 'transfer'
         GROUP BY source_wallet_id
         UNION ALL
         SELECT destination_wallet_id AS wallet_id,
                SUM(amount) AS effect
         FROM transactions
         WHERE user_id = ? AND destination_wallet_id = ? AND type = 'transfer'
         GROUP BY destination_wallet_id
       ) effects
       GROUP BY wallet_id
     ) e ON e.wallet_id = w.id
     WHERE w.user_id = ? AND w.id = ?`,
    userId, walletId,
    userId, walletId,
    userId, walletId,
    userId, walletId,
  );
  return row ? { ...walletFromRow(row), balance: Number((row as any).balance) } : undefined;
}
export async function createDeviceWallet(input: Omit<Wallet, "id" | "createdAt" | "updatedAt">): Promise<Wallet> {
  const db = await getDeviceDatabase(); await migrateDatabase(db); const now = new Date();
  const result = await db.runAsync(`INSERT INTO wallets (user_id, name, type, currency, opening_balance, allow_negative, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, input.userId, input.name, input.type, input.currency, input.openingBalance, input.allowNegative, input.isArchived, now.toISOString(), now.toISOString());
  return { ...input, id: result.lastInsertRowId, createdAt: now, updatedAt: now };
}
export async function updateDeviceWallet(userId: number, walletId: number, input: Partial<Pick<Wallet, "name" | "type" | "allowNegative">>): Promise<Wallet> {
  const db = await getDeviceDatabase(); await migrateDatabase(db); const current = await getDeviceWallet(userId, walletId); if (!current) throw new Error("Wallet not found.");
  const name = input.name?.trim() || current.name; const type = input.type ?? current.type; const allowNegative = input.allowNegative == null ? current.allowNegative : input.allowNegative;
  await db.runAsync("UPDATE wallets SET name = ?, type = ?, allow_negative = ?, updated_at = ? WHERE user_id = ? AND id = ?", name, type, allowNegative, new Date().toISOString(), userId, walletId);
  const updated = await getDeviceWalletWithBalance(userId, walletId);
  if (!updated) throw new Error("Wallet not found after update.");
  return updated;
}
export async function archiveDeviceWallet(userId: number, walletId: number): Promise<Wallet> {
  const db = await getDeviceDatabase(); await migrateDatabase(db); const current = await getDeviceWallet(userId, walletId); if (!current) throw new Error("Wallet not found.");
  await db.runAsync("UPDATE wallets SET is_archived = 1, updated_at = ? WHERE user_id = ? AND id = ?", new Date().toISOString(), userId, walletId);
  const archived = await getDeviceWalletWithBalance(userId, walletId);
  if (!archived) throw new Error("Wallet not found after archive.");
  return archived;
}

export async function restoreDeviceWallet(userId: number, walletId: number): Promise<Wallet> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const current = await getDeviceWallet(userId, walletId);
  if (!current) throw new Error("Wallet not found.");
  if (current.isArchived === 0) throw new Error("Wallet is already active.");
  await db.runAsync(
    "UPDATE wallets SET is_archived = 0, updated_at = ? WHERE user_id = ? AND id = ?",
    new Date().toISOString(),
    userId,
    walletId,
  );
  const restored = await getDeviceWalletWithBalance(userId, walletId);
  if (!restored) throw new Error("Wallet not found after restore.");
  return restored;
}

export async function deleteArchivedDeviceWallet(userId: number, walletId: number): Promise<void> {
  const db = await getDeviceDatabase();
  await migrateDatabase(db);
  await db.withTransactionAsync(async () => {
    const wallet = await db.getFirstAsync<{ is_archived: number }>(
      "SELECT is_archived FROM wallets WHERE user_id = ? AND id = ?",
      userId,
      walletId,
    );
    if (!wallet) throw new Error("Wallet not found.");
    if (Number(wallet.is_archived) !== 1) throw new Error("Chỉ có thể xóa ví đã lưu trữ.");

    const transaction = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM transactions WHERE user_id = ? AND (wallet_id = ? OR source_wallet_id = ? OR destination_wallet_id = ?) LIMIT 1",
      userId,
      walletId,
      walletId,
      walletId,
    );
    if (transaction) throw new Error("Không thể xóa ví đã có giao dịch. Hãy giữ ví ở trạng thái lưu trữ để bảo toàn lịch sử.");

    await db.runAsync("DELETE FROM wallets WHERE user_id = ? AND id = ?", userId, walletId);
  });
}
export async function listDeviceTransactions(userId: number): Promise<Transaction[]> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const rows = await db.getAllAsync(`SELECT * FROM transactions WHERE user_id = ? ORDER BY occurred_at DESC`, userId); return rows.map(transactionFromRow);
}

const BALANCE_EFFECT_SQL = `
  SELECT wallet_id, SUM(effect) AS balance_effect
  FROM (
    SELECT wallet_id,
           SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) AS effect
    FROM transactions
    WHERE user_id = ? AND wallet_id IS NOT NULL AND type IN ('income', 'expense')
    GROUP BY wallet_id
    UNION ALL
    SELECT source_wallet_id AS wallet_id,
           SUM(-amount) AS effect
    FROM transactions
    WHERE user_id = ? AND source_wallet_id IS NOT NULL AND type = 'transfer'
    GROUP BY source_wallet_id
    UNION ALL
    SELECT destination_wallet_id AS wallet_id,
           SUM(amount) AS effect
    FROM transactions
    WHERE user_id = ? AND destination_wallet_id IS NOT NULL AND type = 'transfer'
    GROUP BY destination_wallet_id
  ) effects
  GROUP BY wallet_id
`;

export async function getDeviceWalletBalanceFromDatabase(
  db: SQLiteDatabase,
  userId: number,
  walletId: number,
): Promise<number> {
  const row = await db.getFirstAsync<{ opening_balance: number; balance_effect: number | null }>(
    `SELECT w.opening_balance, COALESCE(e.balance_effect, 0) AS balance_effect
     FROM wallets w
     LEFT JOIN (
       SELECT SUM(effect) AS balance_effect
       FROM (
         SELECT SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) AS effect
         FROM transactions
         WHERE user_id = ? AND wallet_id = ? AND type IN ('income', 'expense')
         UNION ALL
         SELECT SUM(-amount) AS effect
         FROM transactions
         WHERE user_id = ? AND source_wallet_id = ? AND type = 'transfer'
         UNION ALL
         SELECT SUM(amount) AS effect
         FROM transactions
         WHERE user_id = ? AND destination_wallet_id = ? AND type = 'transfer'
       ) effects
     ) e ON 1 = 1
     WHERE w.user_id = ? AND w.id = ?`,
    userId, walletId,
    userId, walletId,
    userId, walletId,
    userId, walletId,
  );
  if (!row) throw new Error("Wallet not found.");
  return Number(row.opening_balance) + Number(row.balance_effect ?? 0);
}

export async function getDeviceWalletBalance(userId: number, walletId: number): Promise<number> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  return getDeviceWalletBalanceFromDatabase(db, userId, walletId);
}

export async function listDeviceWalletsWithBalances(userId: number): Promise<(Wallet & { balance: number })[]> {
  const db = await getDeviceDatabase(); await migrateDatabase(db);
  const rows = await db.getAllAsync(
    `SELECT w.*, w.opening_balance + COALESCE(e.balance_effect, 0) AS balance
     FROM wallets w
     LEFT JOIN (${BALANCE_EFFECT_SQL}) e ON e.wallet_id = w.id
     WHERE w.user_id = ?
     ORDER BY w.is_archived DESC, w.created_at DESC`,
    userId, userId, userId, userId,
  );
  return rows.map((row: any) => ({ ...walletFromRow(row), balance: Number(row.balance) }));
}

function validateTransactionInput(input: Omit<Transaction, "id" | "createdAt" | "updatedAt">) {
  if (!Number.isSafeInteger(input.userId) || input.userId <= 0) throw new Error("Invalid user id.");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error("Transaction amount must be a positive integer.");
  if (input.type === "transfer") {
    if (input.walletId != null || input.categoryId != null) throw new Error("Transfer must use source and destination wallets.");
    if (input.sourceWalletId == null || input.destinationWalletId == null) throw new Error("Transfer requires source and destination wallets.");
    if (input.sourceWalletId === input.destinationWalletId) throw new Error("Transfer wallets must be different.");
  } else {
    if (input.walletId == null) throw new Error("Income and expense require a wallet.");
    if (input.sourceWalletId != null || input.destinationWalletId != null) throw new Error("Income and expense cannot use transfer wallets.");
  }
}
export async function createDeviceTransaction(input: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
  const db = await getDeviceDatabase(); await migrateDatabase(db); validateTransactionInput(input);
  const now = new Date();
  const occurredAt = input.occurredAt ?? now;
  if (Number.isNaN(occurredAt.getTime())) throw new Error("Transaction date is invalid.");
  let transaction: Transaction;
  await db.withTransactionAsync(async () => {
    if (input.categoryId != null) {
      const category = await db.getFirstAsync<{ id: number; type: string; is_archived: number }>(
        "SELECT id, type, is_archived FROM categories WHERE user_id = ? AND id = ?",
        input.userId,
        input.categoryId,
      );
      if (!category) throw new Error("Category not found.");
      if (Number(category.is_archived) === 1) throw new Error("Không thể sử dụng danh mục đã lưu trữ.");
      if (category.type !== input.type) throw new Error("Category type does not match transaction type.");
    }
    const walletIds = Array.from(new Set(
      [input.walletId, input.sourceWalletId, input.destinationWalletId]
        .filter((id): id is number => id != null),
    ));
    const placeholders = walletIds.map(() => "?").join(", ");
    const walletRows = await db.getAllAsync<{
      id: number;
      currency: string;
      allow_negative: number;
      is_archived: number;
    }>(
      `SELECT id, currency, allow_negative, is_archived
       FROM wallets
       WHERE user_id = ? AND id IN (${placeholders})`,
      input.userId,
      ...walletIds,
    );
    if (walletRows.length !== walletIds.length) throw new Error("Wallet not found.");
    const wallets = new Map(walletRows.map((wallet) => [Number(wallet.id), wallet]));
    if (walletRows.some((wallet) => Number(wallet.is_archived) === 1)) {
      throw new Error("Không thể ghi giao dịch vào ví đã lưu trữ.");
    }
    if (input.type === "transfer") {
      const source = wallets.get(input.sourceWalletId!); const destination = wallets.get(input.destinationWalletId!);
      if (!source || !destination) throw new Error("Transfer wallets not found.");
      if (source.currency !== destination.currency || source.currency !== input.currency) throw new Error("Transfer wallets must use the same currency.");
    } else {
      const wallet = wallets.get(input.walletId!); if (!wallet || wallet.currency !== input.currency) throw new Error("Transaction currency does not match wallet currency.");
    }
    if (input.type === "expense" || input.type === "transfer") {
      const sourceWalletId = input.type === "expense" ? input.walletId! : input.sourceWalletId!; const sourceWallet = wallets.get(sourceWalletId)!;
      if (Number(sourceWallet.allow_negative) !== 1) {
        const balance = await getDeviceWalletBalanceFromDatabase(db, input.userId, sourceWalletId);
        if (balance - input.amount < 0) throw new Error("Số dư ví không đủ để thực hiện khoản chi này.");
      }
    }
    const result = await db.runAsync(`INSERT INTO transactions (user_id, type, amount, currency, wallet_id, source_wallet_id, destination_wallet_id, category_id, note, occurred_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, input.userId, input.type, input.amount, input.currency, input.walletId, input.sourceWalletId, input.destinationWalletId, input.categoryId, input.note, occurredAt.toISOString(), now.toISOString(), now.toISOString());
    transaction = { ...input, id: result.lastInsertRowId, createdAt: now, updatedAt: now, occurredAt };
  });
  DeviceEventEmitter.emit(DEVICE_TRANSACTIONS_CHANGED_EVENT, transaction!); return transaction!;
}
