import type { Wallet } from "../../../../drizzle/schema";
import type {
  IWalletRepository,
  NewWallet,
} from "../../../core/database/repository-contracts";
import type { CreateWalletInput, WalletSummary } from "../types/wallet.types";

const SUPPORTED_CURRENCIES = /^[A-Z]{3}$/;

export class WalletService {
  constructor(private readonly repository: IWalletRepository) {}

  async createWallet(input: CreateWalletInput): Promise<WalletSummary> {
    const name = input.name.trim();
    if (!name) throw new Error("Wallet name is required");

    if (!Number.isInteger(input.userId) || input.userId <= 0) {
      throw new Error("Invalid user id");
    }

    const currency = (input.currency ?? "VND").trim().toUpperCase();
    if (!SUPPORTED_CURRENCIES.test(currency)) {
      throw new Error("Currency must be a 3-letter code");
    }

    const openingBalance = input.openingBalance ?? 0;
    if (!Number.isSafeInteger(openingBalance)) {
      throw new Error("Opening balance must be a safe integer");
    }

    const wallet: NewWallet = {
      userId: input.userId,
      name,
      type: input.type,
      currency,
      openingBalance,
      allowNegative: input.allowNegative ? 1 : 0,
      isArchived: 0,
    };

    return this.toSummary(await this.repository.create(wallet));
  }

  async getWallet(userId: number, walletId: number): Promise<WalletSummary | undefined> {
    const wallet = await this.repository.findById(userId, walletId);
    return wallet ? this.toSummary(wallet) : undefined;
  }

  async listWallets(userId: number): Promise<WalletSummary[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid user id");
    }

    const wallets = await this.repository.listByUser(userId);
    return wallets.map((wallet) => this.toSummary(wallet));
  }

  private toSummary(wallet: Wallet & { balance?: number }): WalletSummary {
    return {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      currency: wallet.currency,
      openingBalance: wallet.openingBalance,
      balance: Number(wallet.balance ?? wallet.openingBalance),
      allowNegative: wallet.allowNegative === 1,
      isArchived: wallet.isArchived === 1,
    };
  }
}