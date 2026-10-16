import { DeviceWalletRepository } from "./repository/device-wallet.repository";
import { WalletService } from "./service/wallet.service";

export function createWalletDependencies() {
  const walletRepository = new DeviceWalletRepository();
  const walletService = new WalletService(walletRepository);

  return { walletRepository, walletService };
}
