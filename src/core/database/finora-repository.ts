import type {
  Account,
  Category,
  InsertAccount,
  InsertCategory,
  InsertTransaction,
  Transaction,
} from "../../../drizzle/schema";

export type TransactionFilter = {
  from?: Date;
  to?: Date;
  accountId?: number;
  categoryId?: number;
  type?: Transaction["type"];
};

export interface IFinoraRepository {
  listAccounts(userId: number): Promise<Account[]>;
  getAccount(userId: number, accountId: number): Promise<Account | undefined>;
  createAccount(input: InsertAccount): Promise<Account>;
  updateAccount(
    userId: number,
    accountId: number,
    input: Partial<InsertAccount>,
  ): Promise<Account | undefined>;
  archiveAccount(userId: number, accountId: number): Promise<void>;

  listCategories(userId: number): Promise<Category[]>;
  getCategory(userId: number, categoryId: number): Promise<Category | undefined>;
  createCategory(input: InsertCategory): Promise<Category>;
  updateCategory(
    userId: number,
    categoryId: number,
    input: Partial<InsertCategory>,
  ): Promise<Category | undefined>;

  listTransactions(userId: number, filter?: TransactionFilter): Promise<Transaction[]>;
  getTransaction(userId: number, transactionId: number): Promise<Transaction | undefined>;
  createTransaction(input: InsertTransaction): Promise<Transaction>;
  updateTransaction(
    userId: number,
    transactionId: number,
    input: Partial<InsertTransaction>,
  ): Promise<Transaction | undefined>;
  deleteTransaction(userId: number, transactionId: number): Promise<void>;
}
