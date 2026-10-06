import {
  createDeviceWallet,
  getDeviceWalletWithBalance,
  listDeviceWalletsWithBalances,
  updateDeviceWallet,
  archiveDeviceWallet,
  restoreDeviceWallet,
  deleteArchivedDeviceWallet,
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
    return getDeviceWalletWithBalance(userId, walletId);
  }

  async listByUser(userId: number) {
    return listDeviceWalletsWithBalances(userId);
  }

  async update(userId: number, walletId: number, input: Partial<Pick<NewWallet, "name" | "type" | "allowNegative">>) {
    return updateDeviceWallet(userId, walletId, input);
  }

  async archive(userId: number, walletId: number) {
    return archiveDeviceWallet(userId, walletId);
  }

  async restore(userId: number, walletId: number) {
    return restoreDeviceWallet(userId, walletId);
  }

  async delete(userId: number, walletId: number) {
    return deleteArchivedDeviceWallet(userId, walletId);
  }
}
