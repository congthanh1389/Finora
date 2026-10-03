import type { IWalletRepository, NewWallet } from "../../../core/database/repository-contracts";
import {
  createLocalWallet,
  getLocalWallet,
  listLocalWallets,
} from "../../../../server/local-store";

export class WalletRepository implements IWalletRepository {
  async create(input: NewWallet) {
    return createLocalWallet({
      ...input,
      currency: input.currency ?? "VND",
      allowNegative: input.allowNegative ?? 0,
      isArchived: input.isArchived ?? 0,
    });
  }

  async findById(userId: number, walletId: number) {
    return getLocalWallet(userId, walletId);
  }

  async listByUser(userId: number) {
    return listLocalWallets(userId);
  }
}
