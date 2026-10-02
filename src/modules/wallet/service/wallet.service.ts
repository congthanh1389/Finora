import type { Account, Transaction } from "../../../../drizzle/schema";
import type { IFinoraRepository } from "../../../core/database/finora-repository";
import type { WalletBalance } from "../types/wallet.types";

function toMinorUnits(value: string | number | null | undefined): bigint {
  const normalized = String(value ?? "0").trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  if (!/^\d+$/.test(wholePart || "0") || !/^\d*$/.test(fractionPart)) {
    throw new Error(`Invalid monetary value: ${normalized}`);
  }
  const fraction = (fractionPart + "00").slice(0, 2);
  const minor = BigInt(wholePart || "0") * 100n + BigInt(fraction);
  return negative ? -minor : minor;
}

function formatMinorUnits(value: bigint): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / 100n;
  const fraction = String(absolute % 100n).padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

function addMoney(...values: Array<string | number | null | undefined>): bigint {
  return values.reduce((total, value) => total + toMinorUnits(value), 0n);
}

function transactionEffect(walletId: number, transaction: Transaction): bigint {
  const amount = toMinorUnits(transaction.amount);

  switch (transaction.type) {
    case "income":
      return transaction.accountId === walletId ? amount : 0n;
    case "expense":
      return transaction.accountId === walletId ? -amount : 0n;
    case "transfer":
      if (transaction.accountId === walletId) return -amount;
      if (transaction.transferAccountId === walletId) return amount;
      return 0n;
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
      0n,
    );

    return {
      walletId: wallet.id,
      currency: wallet.currency,
      openingBalance: String(wallet.openingBalance),
      transactionEffect: formatMinorUnits(transactionEffectTotal),
      currentBalance: formatMinorUnits(addMoney(wallet.openingBalance) + transactionEffectTotal),
    };
  }

  async archiveWallet(userId: number, walletId: number): Promise<void> {
    const wallet = await this.repository.getAccount(userId, walletId);
    if (!wallet) throw new Error("Wallet not found");
    await this.repository.archiveAccount(userId, walletId);
  }
}
