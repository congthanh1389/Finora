import type { Wallet } from "../../../../drizzle/schema";
import type { IWalletRepository, NewWallet } from "../../../core/database/repository-contracts";
import type { CreateWalletInput, WalletSummary } from "../types/wallet.types";

const SUPPORTED_CURRENCIES = /^[A-Z]{3}$/;
const normalizeWalletName = (name: string) => name.trim().toLocaleLowerCase();

export class WalletService {
  constructor(private readonly repository: IWalletRepository) {}
  async createWallet(input: CreateWalletInput): Promise<WalletSummary> {
    const name = input.name.trim();
    if (!name) throw new Error("Wallet name is required");
    if (!Number.isInteger(input.userId) || input.userId <= 0) throw new Error("Invalid user id");
    const existingWallets = await this.repository.listByUser(input.userId);
    if (existingWallets.some((wallet) => normalizeWalletName(wallet.name) === normalizeWalletName(name))) throw new Error("Wallet name already exists");
    const currency = (input.currency ?? "VND").trim().toUpperCase();
    if (!SUPPORTED_CURRENCIES.test(currency)) throw new Error("Currency must be a 3-letter code");
    const openingBalance = input.openingBalance ?? 0;
    if (!Number.isSafeInteger(openingBalance)) throw new Error("Opening balance must be a safe integer");
    const wallet: NewWallet = { userId: input.userId, name, type: input.type, currency, openingBalance, allowNegative: input.allowNegative ? 1 : 0, isArchived: 0 };
    return this.toSummary(await this.repository.create(wallet));
  }
  async getWallet(userId: number, walletId: number): Promise<WalletSummary | undefined> { const wallet = await this.repository.findById(userId, walletId); return wallet ? this.toSummary(wallet) : undefined; }
  async updateWallet(userId: number, walletId: number, input: Partial<Pick<WalletSummary, "name" | "type" | "allowNegative">>): Promise<WalletSummary> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id");
    if (input.name !== undefined && !input.name.trim()) throw new Error("Wallet name is required");
    const current = await this.repository.findById(userId, walletId);
    if (!current) throw new Error("Wallet not found.");
    if (input.name !== undefined && (await this.repository.listByUser(userId)).some((wallet) => wallet.id !== current.id && normalizeWalletName(wallet.name) === normalizeWalletName(input.name!))) throw new Error("Wallet name already exists");
    const repositoryInput: Partial<Pick<Wallet, "name" | "type" | "allowNegative">> = {};
    if (input.name !== undefined) repositoryInput.name = input.name.trim();
    if (input.type !== undefined) repositoryInput.type = input.type;
    if (input.allowNegative !== undefined) repositoryInput.allowNegative = input.allowNegative ? 1 : 0;
    return this.toSummary(await this.repository.update(userId, walletId, repositoryInput));
  }
  async archiveWallet(userId: number, walletId: number): Promise<WalletSummary> { if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id"); if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id"); return this.toSummary(await this.repository.archive(userId, walletId)); }
  async restoreWallet(userId: number, walletId: number): Promise<WalletSummary> { if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id"); if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id"); return this.toSummary(await this.repository.restore(userId, walletId)); }
  async deleteArchivedWallet(userId: number, walletId: number): Promise<void> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    if (!Number.isInteger(walletId) || walletId <= 0) throw new Error("Invalid wallet id");
    return this.repository.delete(userId, walletId);
  }
  async listWallets(userId: number): Promise<WalletSummary[]> { if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id"); return (await this.repository.listByUser(userId)).map((wallet) => this.toSummary(wallet)); }
  private toSummary(wallet: Wallet & { balance?: number }): WalletSummary { return { id: wallet.id, name: wallet.name, type: wallet.type, currency: wallet.currency, openingBalance: wallet.openingBalance, balance: Number(wallet.balance ?? wallet.openingBalance), allowNegative: wallet.allowNegative === 1, isArchived: wallet.isArchived === 1 }; }
}
