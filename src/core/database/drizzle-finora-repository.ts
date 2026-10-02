import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
  accounts,
  categories,
  transactions,
  type Account,
  type Category,
  type InsertAccount,
  type InsertCategory,
  type InsertTransaction,
  type Transaction,
} from "../../../drizzle/schema";
import { getDb } from "../../../server/db";
import type { IFinoraRepository, TransactionFilter } from "./finora-repository";

function requireDb() {
  return getDb().then((db) => {
    if (!db) {
      throw new Error("Database is not available");
    }
    return db;
  });
}

export class DrizzleFinoraRepository implements IFinoraRepository {
  async listAccounts(userId: number): Promise<Account[]> {
    const db = await requireDb();
    return db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));
  }

  async getAccount(userId: number, accountId: number): Promise<Account | undefined> {
    const db = await requireDb();
    const rows = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.id, accountId)))
      .limit(1);
    return rows[0];
  }

  async createAccount(input: InsertAccount): Promise<Account> {
    const db = await requireDb();
    const result = await db.insert(accounts).values(input);
    const accountId = Number(result[0].insertId);
    const account = await this.getAccount(input.userId, accountId);
    if (!account) throw new Error("Failed to create account");
    return account;
  }

  async updateAccount(
    userId: number,
    accountId: number,
    input: Partial<InsertAccount>,
  ): Promise<Account | undefined> {
    const db = await requireDb();
    await db
      .update(accounts)
      .set(input)
      .where(and(eq(accounts.userId, userId), eq(accounts.id, accountId)));
    return this.getAccount(userId, accountId);
  }

  async archiveAccount(userId: number, accountId: number): Promise<void> {
    const db = await requireDb();
    await db
      .update(accounts)
      .set({ isArchived: 1 })
      .where(and(eq(accounts.userId, userId), eq(accounts.id, accountId)));
  }

  async listCategories(userId: number): Promise<Category[]> {
    const db = await requireDb();
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.isSystem, 0)))
      .orderBy(categories.name);
  }

  async getCategory(userId: number, categoryId: number): Promise<Category | undefined> {
    const db = await requireDb();
    const rows = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, userId),
        ),
      )
      .limit(1);
    return rows[0];
  }

  async createCategory(input: InsertCategory): Promise<Category> {
    const db = await requireDb();
    const result = await db.insert(categories).values(input);
    const categoryId = Number(result[0].insertId);
    const category = await this.getCategory(input.userId ?? 0, categoryId);
    if (!category) throw new Error("Failed to create category");
    return category;
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    input: Partial<InsertCategory>,
  ): Promise<Category | undefined> {
    const db = await requireDb();
    await db
      .update(categories)
      .set(input)
      .where(and(eq(categories.userId, userId), eq(categories.id, categoryId)));
    return this.getCategory(userId, categoryId);
  }

  async listTransactions(userId: number, filter: TransactionFilter = {}): Promise<Transaction[]> {
    const db = await requireDb();
    const conditions = [eq(transactions.userId, userId)];

    if (filter.from) conditions.push(gte(transactions.transactionDate, filter.from));
    if (filter.to) conditions.push(lte(transactions.transactionDate, filter.to));
    if (filter.accountId) conditions.push(eq(transactions.accountId, filter.accountId));
    if (filter.categoryId) conditions.push(eq(transactions.categoryId, filter.categoryId));
    if (filter.type) conditions.push(eq(transactions.type, filter.type));

    return db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate), desc(transactions.id));
  }

  async getTransaction(userId: number, transactionId: number): Promise<Transaction | undefined> {
    const db = await requireDb();
    const rows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, transactionId)))
      .limit(1);
    return rows[0];
  }

  async createTransaction(input: InsertTransaction): Promise<Transaction> {
    const db = await requireDb();
    const result = await db.insert(transactions).values(input);
    const transactionId = Number(result[0].insertId);
    const transaction = await this.getTransaction(input.userId, transactionId);
    if (!transaction) throw new Error("Failed to create transaction");
    return transaction;
  }

  async updateTransaction(
    userId: number,
    transactionId: number,
    input: Partial<InsertTransaction>,
  ): Promise<Transaction | undefined> {
    const db = await requireDb();
    await db
      .update(transactions)
      .set(input)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, transactionId)));
    return this.getTransaction(userId, transactionId);
  }

  async deleteTransaction(userId: number, transactionId: number): Promise<void> {
    const db = await requireDb();
    await db
      .delete(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.id, transactionId)));
  }
}
