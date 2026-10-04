import type { IWalletRepository, NewWallet } from "../../../core/database/repository-contracts";
import {
  createDeviceWallet,
  getDeviceWallet,
  listDeviceWallets,
} from "../../../core/storage/device-store";

export class WalletRepository implements IWalletRepository {
  async create(input: NewWallet) {
    return createDeviceWallet({
      ...input,
      currency: input.currency ?? "VND",
      openingBalance: input.openingBalance ?? 0,
      allowNegative: input.allowNegative ?? 0,
      isArchived: input.isArchived ?? 0,
    });
  }

  async findById(userId: number, walletId: number) {
    return getDeviceWallet(userId, walletId);
  }

  async listByUser(userId: number) {
    return listDeviceWallets(userId);
  }
}
