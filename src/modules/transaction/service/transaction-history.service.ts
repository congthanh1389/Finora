import type { Transaction } from "../../../../drizzle/schema";
import { CategoryService } from "../../category/service/category.service";
import type { WalletSummary } from "../../wallet/types/wallet.types";
import { WalletService } from "../../wallet/service/wallet.service";
import { TransactionEditService } from "./transaction-edit.service";
import { TransactionSummaryService } from "./transaction-summary.service";
import type { TransactionType } from "../types/transaction.types";

export type TransactionHistoryFilter = "all" | TransactionType;

export type TransactionHistoryFilters = {
  walletId?: number;
  categoryId?: number;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
};

export interface TransactionHistoryRepository {
  listHistoryPage(
    userId: number,
    offset: number,
    type: TransactionHistoryFilter,
    limit: number,
    start?: Date,
    end?: Date,
    filters?: TransactionHistoryFilters,
  ): Promise<{ transactions: Transaction[]; hasMore: boolean }>;
}

export class TransactionHistoryService {
  constructor(
    private readonly repository: TransactionHistoryRepository,
    private readonly walletService: WalletService,
    private readonly categoryService: CategoryService,
    private readonly summaryService: TransactionSummaryService,
    private readonly editService: TransactionEditService,
  ) {}

  async listPage(
    userId: number,
    offset: number,
    type: TransactionHistoryFilter,
    limit: number,
    start?: Date,
    end?: Date,
    filters?: TransactionHistoryFilters,
  ) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Người dùng không hợp lệ.");
    if (!Number.isInteger(offset) || offset < 0) throw new Error("Vị trí phân trang không hợp lệ.");
    if (!Number.isInteger(limit) || limit <= 0) throw new Error("Kích thước trang không hợp lệ.");
    if (filters?.walletId !== undefined && (!Number.isInteger(filters.walletId) || filters.walletId <= 0)) {
      throw new Error("Ví lọc không hợp lệ.");
    }
    if (filters?.categoryId !== undefined && (!Number.isInteger(filters.categoryId) || filters.categoryId <= 0)) {
      throw new Error("Danh mục lọc không hợp lệ.");
    }
    if (filters?.minAmount !== undefined && (!Number.isSafeInteger(filters.minAmount) || filters.minAmount < 0)) {
      throw new Error("Mức tiền tối thiểu không hợp lệ.");
    }
    if (filters?.maxAmount !== undefined && (!Number.isSafeInteger(filters.maxAmount) || filters.maxAmount < 0)) {
      throw new Error("Mức tiền tối đa không hợp lệ.");
    }
    if (filters?.minAmount !== undefined && filters?.maxAmount !== undefined && filters.minAmount > filters.maxAmount) {
      throw new Error("Khoảng tiền không hợp lệ.");
    }
    return this.repository.listHistoryPage(userId, offset, type, limit, start, end, filters);
  }

  async loadReferences(userId: number): Promise<{ wallets: WalletSummary[]; categories: Awaited<ReturnType<CategoryService["listCategories"]>> }> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Người dùng không hợp lệ.");
    const [wallets, categories] = await Promise.all([
      this.walletService.listWallets(userId),
      this.categoryService.listCategories(userId),
    ]);
    return {
      wallets: wallets.filter((wallet) => !wallet.isArchived),
      categories,
    };
  }

  getSummary(userId: number, start: Date, end: Date, type: TransactionHistoryFilter) {
    return this.summaryService.getSummary(userId, start, end, type);
  }

  deleteTransaction(userId: number, transactionId: number) {
    return this.editService.deleteTransaction(userId, transactionId);
  }
}
