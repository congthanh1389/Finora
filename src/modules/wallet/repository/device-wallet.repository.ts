import {
  createDeviceWallet,
  listDeviceWallets,
} from "../../../core/storage/device-store";
import type { NewWallet } from "../../../core/database/repository-contracts";

export class DeviceWalletRepository {
  async create(input: NewWallet) {
    return createDeviceWallet(input);
  }

  async listByUser(userId: number) {
    return listDeviceWallets(userId);
  }
}
