import {
  createDeviceTransaction,
  listDeviceTransactions,
} from "../../../core/storage/device-store";
import type { NewTransaction } from "../../../core/database/repository-contracts";

export class DeviceTransactionRepository {
  async list(userId: number) {
    return listDeviceTransactions(userId);
  }

  async create(input: NewTransaction) {
    return createDeviceTransaction(input);
  }
}
