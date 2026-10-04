import { DeviceEventEmitter } from "react-native";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import type { Category, Wallet, Transaction } from "../../../drizzle/schema";

const DATABASE_NAME = "finora.db";
const CURRENT_SCHEMA_VERSION = 2;

export const DEVICE_TRANSACTIONS_CHANGED_EVENT = "finora:transactions-changed";

let databasePromise: Promise<SQLiteDatabase> | null = null;

async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME);
  }
  return databasePromise;
}

async function migrateDatabase(db: SQLiteDatabase) {
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
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id_occurred_at
        ON transactions(user_id, occurred_at DESC);

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

      CREATE INDEX IF NOT EXISTS idx_categories_user_id_type
        ON categories(user_id, type, is_archived);

      PRAGMA user_version = 2;
    `);
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error("Finora database version is newer than this app.");
  }
}

export async function initializeDeviceStorage() {
  const db = await getDatabase();
  await migrateDatabase(db);
}

function walletFromRow(row: any): Wallet {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    name: String(row.name),
    type: row.type,
    currency: String(row.currency),
    openingBalance: Number(row.opening_balance),
    allowNegative: Number(row.allow_negative),
    isArchived: Number(row.is_archived),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function transactionFromRow(row: any): Transaction {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    type: row.type,
    amount: Number(row.amount),
    currency: String(row.currency),
    walletId: row.wallet_id == null ? null : Number(row.wallet_id),
    sourceWalletId: row.source_wallet_id == null ? null : Number(row.source_wallet_id),
    destinationWalletId:
      row.destination_wallet_id == null ? null : Number(row.destination_wallet_id),
    categoryId: row.category_id == null ? null : Number(row.category_id),
    note: row.note == null ? null : String(row.note),
    occurredAt: new Date(row.occurred_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function categoryFromRow(row: any): Category {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    name: String(row.name),
    type: row.type,
    parentId: row.parent_id == null ? null : Number(row.parent_id),
    icon: row.icon == null ? null : String(row.icon),
    isArchived: Number(row.is_archived),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function listDeviceCategories(
  userId: number,
  type?: Category["type"],
): Promise<Category[]> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const rows = type
    ? await db.getAllAsync(
        `SELECT * FROM categories
         WHERE user_id = ? AND type = ?
         ORDER BY is_archived ASC, name ASC`,
        userId,
        type,
      )
    : await db.getAllAsync(
        `SELECT * FROM categories
         WHERE user_id = ?
         ORDER BY is_archived ASC, type ASC, name ASC`,
        userId,
      );

  return rows.map(categoryFromRow);
}

export async function createDeviceCategory(
  input: Omit<Category, "id" | "createdAt" | "updatedAt">,
): Promise<Category> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const now = new Date();
  const result = await db.runAsync(
    `INSERT INTO categories
      (user_id, name, type, parent_id, icon, is_archived, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.userId,
    input.name,
    input.type,
    input.parentId,
    input.icon,
    input.isArchived,
    now.toISOString(),
    now.toISOString(),
  );

  return {
    ...input,
    id: result.lastInsertRowId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listDeviceUserIds(): Promise<number[]> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const walletRows = await db.getAllAsync<{ user_id: number }>(
    "SELECT DISTINCT user_id FROM wallets",
  );
  const transactionRows = await db.getAllAsync<{ user_id: number }>(
    "SELECT DISTINCT user_id FROM transactions",
  );

  return Array.from(
    new Set([
      ...walletRows.map((row) => Number(row.user_id)),
      ...transactionRows.map((row) => Number(row.user_id)),
    ]),
  )
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);
}

export async function listDeviceWallets(userId: number): Promise<Wallet[]> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const rows = await db.getAllAsync(
    `SELECT * FROM wallets
     WHERE user_id = ?
     ORDER BY is_archived DESC, created_at DESC`,
    userId,
  );

  return rows.map(walletFromRow);
}

export async function getDeviceWallet(userId: number, walletId: number): Promise<Wallet | undefined> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const row = await db.getFirstAsync(
    "SELECT * FROM wallets WHERE user_id = ? AND id = ?",
    userId,
    walletId,
  );

  return row ? walletFromRow(row) : undefined;
}

export async function createDeviceWallet(
  input: Omit<Wallet, "id" | "createdAt" | "updatedAt">,
): Promise<Wallet> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const now = new Date();
  const result = await db.runAsync(
    `INSERT INTO wallets
      (user_id, name, type, currency, opening_balance, allow_negative, is_archived, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.userId,
    input.name,
    input.type,
    input.currency,
    input.openingBalance,
    input.allowNegative,
    input.isArchived,
    now.toISOString(),
    now.toISOString(),
  );

  return {
    ...input,
    id: result.lastInsertRowId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listDeviceTransactions(userId: number): Promise<Transaction[]> {
  const db = await getDatabase();
  await migrateDatabase(db);

  const rows = await db.getAllAsync(
    `SELECT * FROM transactions
     WHERE user_id = ?
     ORDER BY occurred_at DESC`,
    userId,
  );

  return rows.map(transactionFromRow);
}

export async function createDeviceTransaction(
  input: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
): Promise<Transaction> {
  const db = await getDatabase();
  await migrateDatabase(db);

  if (input.walletId != null) {
    const wallet = await db.getFirstAsync(
      "SELECT id FROM wallets WHERE user_id = ? AND id = ?",
      input.userId,
      input.walletId,
    );
    if (!wallet) throw new Error("Wallet not found.");
  }

  const now = new Date();
  const occurredAt = input.occurredAt ?? now;

  const result = await db.runAsync(
    `INSERT INTO transactions
      (user_id, type, amount, currency, wallet_id, source_wallet_id, destination_wallet_id,
       category_id, note, occurred_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.userId,
    input.type,
    input.amount,
    input.currency,
    input.walletId,
    input.sourceWalletId,
    input.destinationWalletId,
    input.categoryId,
    input.note,
    occurredAt.toISOString(),
    now.toISOString(),
    now.toISOString(),
  );

  const transaction: Transaction = {
    ...input,
    id: result.lastInsertRowId,
    createdAt: now,
    updatedAt: now,
    occurredAt,
  };

  DeviceEventEmitter.emit(DEVICE_TRANSACTIONS_CHANGED_EVENT, transaction);
  return transaction;
}
