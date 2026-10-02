import type { Account, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import type { WalletBalance } from "../types/wallet.types";

function money(value: string | number | null | undefined): number {
  return Number(value ?? 0);
}

function formatMoney(value: number): string {
  return value.toFixed(2);
}

function transactionEffect(walletId: number, transaction: Transaction): number {
  const amount = money(transaction.amount);

  switch (transaction.type) {
    case "income":
      return transaction.accountId === walletId ? amount : 0;
    case "expense":
      return transaction.accountId === walletId ? -amount : 0;
    case "transfer":
      if (transaction.accountId === walletId) return -amount;
      if (transaction.transferAccountId === walletId) return amount;
      return 0;
  }
}

export class WalletService {
  constructor(private readonly repository: IFinoraRepository) {}

  async listWallets(userId: number): Promise<Account[]> {
    return this.repository.listAccounts(userId);
  }

  async getWallet(userId: number, walletId: number): Promise<Account | undefined> {
    return this.repository.getAccount(userId, walletId);
  }

  async getBalance(userId: number, walletId: number): Promise<WalletBalance> {
    const wallet = await this.repository.getAccount(userId, walletId);
    if (!wallet) throw new Error("Wallet not found");

    // Read all valid transactions because a transfer affects both source and destination wallets.
    const transactions = await this.repository.listTransactions(userId);
    const transactionEffectTotal = transactions.reduce(
      (total, transaction) => total + transactionEffect(walletId, transaction),
      0,
    );

    return {
      walletId: wallet.id,
      currency: wallet.currency,
      openingBalance: String(wallet.openingBalance),
      transactionEffect: formatMoney(transactionEffectTotal),
      currentBalance: formatMoney(money(wallet.openingBalance) + transactionEffectTotal),
    };
  }

  async archiveWallet(userId: number, walletId: number): Promise<void> {
    const wallet = await this.repository.getAccount(userId, walletId);
    if (!wallet) throw new Error("Wallet not found");
    await this.repository.archiveAccount(userId, walletId);
  }
}
