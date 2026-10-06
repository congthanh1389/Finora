import type { Wallet } from "../../../../drizzle/schema";
import type { IWalletRepository, NewWallet } from "../../../core/database/repository-contracts";
import type { CreateWalletInput, WalletSummary } from "../types/wallet.types";

const SUPPORTED_CURRENCIES = /^[A-Z]{3}$/;

export class WalletService {
  constructor(private readonly repository: IWalletRepository) {}

  async createWallet(input: CreateWalletInput): Promise<WalletSummary> {
    const name = input.name.trim();
    if (!name) throw new Error("Wallet name is required");
    if (!Number.isInteger(input.userId) || input.userId <= 0) throw new Error("Invalid user id");

    const existingWallets = await this.repository.listByUser(input.userId);
    if (existingWallets.some((wallet) => wallet.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
      throw new Error("Wallet name already exists");
    }

    const currency = (input.currency ?? "VND").trim().toUpperCase();
    if (!SUPPORTED_CURRENCIES.test(currency)) throw new Error("Currency must be a 3-letter code");

    const openingBalance = input.openingBalance ?? 0;
    if (!Number.isSafeInteger(openingBalance)) throw new Error("Opening balance must be a safe integer");

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

  async updateWallet(
    userId: number,
    walletId: number,
    input: Partial<Pick<WalletSummary, "name" | "type" | "allowNegative">>,
  ): Promise<WalletSummary> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id");
    if (input.name !== undefined && !input.name.trim()) throw new Error("Wallet name is required");

    if (input.name !== undefined) {
      const wallets = await this.repository.listByUser(userId);
      const normalizedName = input.name.trim().toLocaleLowerCase();
      if (wallets.some((wallet) => wallet.id !== walletId && wallet.name.trim().toLocaleLowerCase() === normalizedName)) {
        throw new Error("Wallet name already exists");
      }
    }

    const repositoryInput: Partial<Pick<Wallet, "name" | "type" | "allowNegative">> = {};
    if (input.name !== undefined) repositoryInput.name = input.name.trim();
    if (input.type !== undefined) repositoryInput.type = input.type;
    if (input.allowNegative !== undefined) repositoryInput.allowNegative = input.allowNegative ? 1 : 0;

    return this.toSummary(await this.repository.update(userId, walletId, repositoryInput));
  }

  async archiveWallet(userId: number, walletId: number): Promise<WalletSummary> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id");
    return this.toSummary(await this.repository.archive(userId, walletId));
  }

  async restoreWallet(userId: number, walletId: number): Promise<WalletSummary> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id");
    return this.toSummary(await this.repository.restore(userId, walletId));
  }

  async listWallets(userId: number): Promise<WalletSummary[]> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
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
