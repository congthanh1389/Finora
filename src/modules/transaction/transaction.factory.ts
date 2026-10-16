import { CategoryRepository } from "../category/repository/category.repository";
import { CategoryService } from "../category/service/category.service";
import { DeviceWalletRepository } from "../wallet/repository/device-wallet.repository";
import { WalletService } from "../wallet/service/wallet.service";
import { DeviceTransactionRepository } from "./repository/device-transaction.repository";
import { DeviceTransactionEditRepository } from "./repository/device-transaction-edit.repository";
import { DeviceTransactionSummaryRepository } from "./repository/device-transaction-summary.repository";
import { TransactionEditService } from "./service/transaction-edit.service";
import { TransactionHistoryService } from "./service/transaction-history.service";
import { TransactionService } from "./service/transaction.service";
import { TransactionSummaryService } from "./service/transaction-summary.service";

export function createTransactionDependencies() {
  const categoryService = new CategoryService(new CategoryRepository());
  const walletService = new WalletService(new DeviceWalletRepository());
  const transactionRepository = new DeviceTransactionRepository();
  const transactionService = new TransactionService(transactionRepository);
  const editService = new TransactionEditService(new DeviceTransactionEditRepository());
  const summaryService = new TransactionSummaryService(new DeviceTransactionSummaryRepository());
  const historyService = new TransactionHistoryService(
    transactionRepository,
    walletService,
    categoryService,
    summaryService,
    editService,
  );

  return {
    categoryService,
    walletService,
    transactionRepository,
    transactionService,
    editService,
    summaryService,
    historyService,
  };
}
