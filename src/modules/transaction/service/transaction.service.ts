import type { CreateTransactionInput, TransactionSummary } from "../types/transaction.types";

type TransactionServiceRepository = {
  list(userId: number): Promise<TransactionSummary[]>;
  listRecent?(userId: number, limit?: number): Promise<TransactionSummary[]>;
  create(input: CreateTransactionInput): Promise<TransactionSummary>;
};

export class TransactionService {
  constructor(private readonly repository: TransactionServiceRepository) {}

  listTransactions(userId: number) {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new Error("Invalid user.");
    }
    return this.repository.list(userId);
  }

  listRecentTransactions(userId: number, limit = 20) {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new Error("Invalid user.");
    }
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      throw new Error("Invalid transaction limit.");
    }
    const listRecent = this.repository.listRecent;
    return listRecent
      ? listRecent.call(this.repository, userId, limit)
      : this.repository.list(userId).then((transactions) => transactions.slice(0, limit));
  }

  createTransaction(input: CreateTransactionInput) {
    if (!Number.isSafeInteger(input.userId) || input.userId <= 0) {
      throw new Error("Invalid user.");
    }

    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw new Error("Transaction amount must be a positive integer.");
    }

    if (input.type === "transfer") {
      if (
        input.sourceWalletId == null ||
        !Number.isSafeInteger(input.sourceWalletId) ||
        input.sourceWalletId <= 0 ||
        input.destinationWalletId == null ||
        !Number.isSafeInteger(input.destinationWalletId) ||
        input.destinationWalletId <= 0
      ) {
        throw new Error("Transfer requires valid source and destination wallets.");
      }
      if (input.sourceWalletId === input.destinationWalletId) {
        throw new Error("Transfer wallets must be different.");
      }
    } else if (
      input.walletId == null ||
      !Number.isSafeInteger(input.walletId) ||
      input.walletId <= 0
    ) {
      throw new Error("Income and expense require a valid wallet.");
    }

    return this.repository.create(input);
  }
}
