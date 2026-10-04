import {
  createDeviceWallet,
  getDeviceWallet,
  listDeviceWallets,
} from "../../../core/storage/device-store";
import type { NewWallet } from "../../../core/database/repository-contracts";

export class DeviceWalletRepository {
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
