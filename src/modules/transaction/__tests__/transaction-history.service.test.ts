import { describe, expect, it, vi } from "vitest";
import {
  TransactionHistoryService,
  type TransactionHistoryRepository,
} from "../service/transaction-history.service";
import type { CategoryService } from "../../category/service/category.service";
import type { WalletService } from "../../wallet/service/wallet.service";
import type { TransactionEditService } from "../service/transaction-edit.service";
import type { TransactionSummaryService } from "../service/transaction-summary.service";

function createService() {
  const repository: TransactionHistoryRepository = {
    listHistoryPage: vi.fn().mockResolvedValue({
      transactions: [],
      hasMore: false,
    }),
  };

  const walletService = {
    listWallets: vi.fn().mockResolvedValue([]),
  } as unknown as WalletService;

  const categoryService = {
    listCategories: vi.fn().mockResolvedValue([]),
  } as unknown as CategoryService;

  const summaryService = {
    getSummary: vi.fn().mockResolvedValue({
      totals: { totalAmount: 0, transactionCount: 0 },
    }),
  } as unknown as TransactionSummaryService;

  const editService = {
    deleteTransaction: vi.fn().mockResolvedValue(undefined),
  } as unknown as TransactionEditService;

  return {
    service: new TransactionHistoryService(
      repository,
      walletService,
      categoryService,
      summaryService,
      editService,
    ),
    repository,
    walletService,
    categoryService,
    summaryService,
    editService,
  };
}

describe("TransactionHistoryService", () => {
  it("delegates history paging to the repository", async () => {
    const { service, repository } = createService();
    const start = new Date("2026-10-01T00:00:00.000Z");
    const end = new Date("2026-11-01T00:00:00.000Z");

    await service.listPage(1, 0, "expense", 50, start, end);

    expect(repository.listHistoryPage).toHaveBeenCalledWith(1, 0, "expense", 50, start, end, undefined);
  });

  it("delegates advanced filters to the repository", async () => {
    const { service, repository } = createService();

    await service.listPage(1, 0, "all", 50, undefined, undefined, {
      walletId: 7,
      categoryId: 9,
      minAmount: 10000,
      maxAmount: 50000,
    });

    expect(repository.listHistoryPage).toHaveBeenCalledWith(
      1,
      0,
      "all",
      50,
      undefined,
      undefined,
      {
        walletId: 7,
        categoryId: 9,
        minAmount: 10000,
        maxAmount: 50000,
      },
    );
  });

  it("forwards advanced filters to the summary service", async () => {
    const { service, summaryService } = createService();
    const start = new Date("2026-10-01T00:00:00.000Z");
    const end = new Date("2026-11-01T00:00:00.000Z");
    const filters = {
      walletId: 7,
      categoryId: 9,
      minAmount: 10000,
      maxAmount: 50000,
      search: "ăn sáng",
    };

    await service.getSummary(1, start, end, "expense", filters);

    expect(summaryService.getSummary).toHaveBeenCalledWith(1, start, end, "expense", filters);
  });

  it("rejects invalid paging input", async () => {
    const { service } = createService();

    await expect(service.listPage(0, 0, "all", 50)).rejects.toThrow("Người dùng không hợp lệ.");
    await expect(service.listPage(1, -1, "all", 50)).rejects.toThrow("Vị trí phân trang không hợp lệ.");
    await expect(service.listPage(1, 0, "all", 0)).rejects.toThrow("Kích thước trang không hợp lệ.");
  });

  it("loads only active wallets and active categories through services", async () => {
    const { service, walletService, categoryService } = createService();
    vi.mocked(walletService.listWallets).mockResolvedValueOnce([
      { id: 1, isArchived: false },
      { id: 2, isArchived: true },
    ] as never);
    vi.mocked(categoryService.listCategories).mockResolvedValueOnce([
      { id: 10, isArchived: 0 },
    ] as never);

    const result = await service.loadReferences(1);

    expect(result.wallets).toHaveLength(1);
    expect(result.wallets[0]?.id).toBe(1);
    expect(result.categories).toHaveLength(1);
  });

  it("delegates delete to the edit service", async () => {
    const { service, editService } = createService();

    await service.deleteTransaction(1, 9);

    expect(editService.deleteTransaction).toHaveBeenCalledWith(1, 9);
  });
});
