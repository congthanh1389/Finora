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
  update(userId: number, walletId: number, input: Partial<Pick<Wallet, "name" | "type" | "allowNegative">>): Promise<Wallet>;
  archive(userId: number, walletId: number): Promise<Wallet>;
  restore(userId: number, walletId: number): Promise<Wallet>;
}

export interface ICategoryRepository {
  create(input: NewCategory): Promise<Category>;
  listByUser(userId: number, type?: Category["type"]): Promise<Category[]>;
  update(userId: number, categoryId: number, name: string): Promise<Category>;
  archive(userId: number, categoryId: number): Promise<Category>;
}

export interface ITransactionRepository {
  create(input: NewTransaction): Promise<Transaction>;
  findById(userId: number, transactionId: number): Promise<Transaction | undefined>;
  list(filter: TransactionFilter): Promise<Transaction[]>;
}
