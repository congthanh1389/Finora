import type {
  Category,
  InsertCategory,
  InsertTransaction,
  InsertWallet,
  Transaction,
  Wallet,
} from "../../../drizzle/schema";

export type NewWallet = Omit<InsertWallet, "id" | "createdAt" | "updatedAt">;
export type NewCategory = Omit<InsertCategory, "id" | "createdAt" | "updatedAt">;
export type NewTransaction = Omit<InsertTransaction, "id" | "createdAt" | "updatedAt">;

export type TransactionFilter = {
  userId: number;
  type?: Transaction["type"];
  walletId?: number;
  categoryId?: number;
  from?: Date;
  to?: Date;
};

export interface IWalletRepository {
  create(input: NewWallet): Promise<Wallet>;
  findById(userId: number, walletId: number): Promise<Wallet | undefined>;
  listByUser(userId: number): Promise<Wallet[]>;
}

export interface ICategoryRepository {
  create(input: NewCategory): Promise<Category>;
  listByUser(userId: number, type?: Category["type"]): Promise<Category[]>;
}

export interface ITransactionRepository {
  create(input: NewTransaction): Promise<Transaction>;
  findById(userId: number, transactionId: number): Promise<Transaction | undefined>;
  list(filter: TransactionFilter): Promise<Transaction[]>;
}