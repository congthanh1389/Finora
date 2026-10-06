import type { CreateTransactionInput, TransactionSummary } from "../types/transaction.types";

type TransactionServiceRepository = {
  list(userId: number): Promise<TransactionSummary[]>;
  listRecent?(userId: number, limit?: number): Promise<TransactionSummary[]>;
  listRecentByWallet?(userId: number, walletId: number, limit?: number): Promise<TransactionSummary[]>;
  create(input: CreateTransactionInput): Promise<TransactionSummary>;
};

export class TransactionService {
  constructor(private readonly repository: TransactionServiceRepository) {}

  listTransactions(userId: number) {
    return this.repository.list(userId);
  }

  listRecentTransactions(userId: number, limit = 20) {
    const listRecent = this.repository.listRecent;
    return listRecent
      ? listRecent.call(this.repository, userId, limit)
      : this.repository.list(userId).then((transactions) => transactions.slice(0, limit));
  }

  listRecentTransactionsByWallet(userId: number, walletId: number, limit = 20) {
    const listRecentByWallet = this.repository.listRecentByWallet;
    return listRecentByWallet
      ? listRecentByWallet.call(this.repository, userId, walletId, limit)
      : this.repository
          .list(userId)
          .then((transactions) =>
            transactions
              .filter(
                (transaction) =>
                  transaction.walletId === walletId ||
                  transaction.sourceWalletId === walletId ||
                  transaction.destinationWalletId === walletId,
              )
              .slice(0, limit),
          );
  }

  createTransaction(input: CreateTransactionInput) {
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
      throw new Error("Transaction amount must be a positive integer.");
    }

    if (input.type === "transfer") {
      if (!input.sourceWalletId || !input.destinationWalletId) {
        throw new Error("Transfer requires source and destination wallets.");
      }
      if (input.sourceWalletId === input.destinationWalletId) {
        throw new Error("Transfer wallets must be different.");
      }
    } else if (!input.walletId) {
      throw new Error("Income and expense require a wallet.");
    }

    return this.repository.create(input);
  }
}
