import {
  createDeviceWallet,
  getDeviceWallet,
  listDeviceWallets,
} from "../../../core/storage/device-store";
import type { NewWallet } from "../../../core/database/repository-contracts";

export class DeviceWalletRepository {
  async create(input: NewWallet) {
    return createDeviceWallet(input);
  }

  async findById(userId: number, walletId: number) {
    return getDeviceWallet(userId, walletId);
  }

  async listByUser(userId: number) {
    return listDeviceWallets(userId);
  }
}
