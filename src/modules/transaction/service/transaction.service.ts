import type {
  Account,
  Category,
  InsertTransaction,
  Transaction,
} from "../../../../drizzle/schema";
import type {
  IFinoraRepository,
  TransactionFilter,
} from "../../../core/database/finora-repository";

export type CreateTransactionInput = {
  userId: number;
  accountId: number;
  categoryId?: number | null;
  type: Transaction["type"];
  amount: string | number;
  transactionDate?: Date;
  note?: string | null;
  transferAccountId?: number | null;
};

export type UpdateTransactionInput = Partial<
  Pick<
    CreateTransactionInput,
    "accountId" | "categoryId" | "type" | "amount" | "transactionDate" | "note" | "transferAccountId"
  >
>;

function normalizeAmount(value: string | number): string {
  const amount = String(value).trim();
  const match = amount.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) {
    throw new Error("Transaction amount must be greater than zero");
  }

  const whole = match[1];
  const fraction = match[2] ?? "";
  if (BigInt(whole) === 0n && /^0*$/.test(fraction)) {
    throw new Error("Transaction amount must be greater than zero");
  }

  return `${whole}.${(fraction + "00").slice(0, 2)}`;
}

export class TransactionService {
  constructor(private readonly repository: IFinoraRepository) {}

  async listTransactions(userId: number, filter?: TransactionFilter): Promise<Transaction[]> {
    return this.repository.listTransactions(userId, filter);
  }

  async getTransaction(userId: number, transactionId: number): Promise<Transaction | undefined> {
    return this.repository.getTransaction(userId, transactionId);
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const account = await this.requireActiveAccount(input.userId, input.accountId);
    const transferAccount =
      input.type === "transfer" && input.transferAccountId != null
        ? await this.requireActiveAccount(input.userId, input.transferAccountId)
        : undefined;

    if (input.type === "transfer") {
      if (input.transferAccountId == null) {
        throw new Error("Transfer destination is required");
      }
      if (input.transferAccountId === input.accountId) {
        throw new Error("Transfer source and destination must differ");
      }
      if (input.categoryId != null) {
        throw new Error("Transfer does not use a category");
      }
      void transferAccount;
    } else {
      if (input.transferAccountId != null) {
        throw new Error("Income and expense do not use a transfer destination");
      }
      if (input.categoryId == null) {
        throw new Error("Category is required");
      }
      await this.requireMatchingCategory(input.userId, input.categoryId, input.type);
    }

    const insert: InsertTransaction = {
      userId: input.userId,
      accountId: account.id,
      categoryId: input.categoryId ?? null,
      type: input.type,
      amount: normalizeAmount(input.amount),
      transactionDate: input.transactionDate ?? new Date(),
      note: input.note?.trim() || null,
      transferAccountId: input.transferAccountId ?? null,
      isVoided: 0,
    };

    return this.repository.createTransaction(insert);
  }

  async updateTransaction(
    userId: number,
    transactionId: number,
    input: UpdateTransactionInput,
  ): Promise<Transaction | undefined> {
    const current = await this.repository.getTransaction(userId, transactionId);
    if (!current || current.isVoided !== 0) return undefined;

    const next = {
      accountId: input.accountId ?? current.accountId,
      categoryId: input.categoryId !== undefined ? input.categoryId : current.categoryId,
      type: input.type ?? current.type,
      amount: input.amount !== undefined ? normalizeAmount(input.amount) : current.amount,
      transactionDate: input.transactionDate ?? current.transactionDate,
      note: input.note !== undefined ? input.note?.trim() || null : current.note,
      transferAccountId:
        input.transferAccountId !== undefined ? input.transferAccountId : current.transferAccountId,
    };

    await this.requireActiveAccount(userId, next.accountId);

    if (next.type === "transfer") {
      if (next.transferAccountId == null) throw new Error("Transfer destination is required");
      if (next.transferAccountId === next.accountId) {
        throw new Error("Transfer source and destination must differ");
      }
      if (next.categoryId != null) throw new Error("Transfer does not use a category");
      await this.requireActiveAccount(userId, next.transferAccountId);
    } else {
      if (next.transferAccountId != null) {
        throw new Error("Income and expense do not use a transfer destination");
      }
      if (next.categoryId == null) throw new Error("Category is required");
      await this.requireMatchingCategory(userId, next.categoryId, next.type);
    }

    return this.repository.updateTransaction(userId, transactionId, {
      accountId: next.accountId,
      categoryId: next.categoryId,
      type: next.type,
      amount: next.amount,
      transactionDate: next.transactionDate,
      note: next.note,
      transferAccountId: next.transferAccountId,
    });
  }

  async voidTransaction(userId: number, transactionId: number): Promise<void> {
    const current = await this.repository.getTransaction(userId, transactionId);
    if (!current) throw new Error("Transaction not found");
    if (current.isVoided !== 0) return;
    await this.repository.updateTransaction(userId, transactionId, { isVoided: 1 });
  }

  private async requireActiveAccount(userId: number, accountId: number): Promise<Account> {
    const account = await this.repository.getAccount(userId, accountId);
    if (!account || account.isArchived !== 0) throw new Error("Wallet not found");
    return account;
  }

  private async requireMatchingCategory(
    userId: number,
    categoryId: number,
    transactionType: "income" | "expense",
  ): Promise<Category> {
    const category = await this.repository.getCategory(userId, categoryId);
    if (!category || category.isArchived !== 0) throw new Error("Category not found");
    if (category.type !== transactionType) {
      throw new Error("Category type does not match transaction type");
    }
    return category;
  }
}
