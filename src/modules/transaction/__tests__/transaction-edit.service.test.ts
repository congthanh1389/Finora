import { describe, expect, it, vi } from "vitest";

import { TransactionEditService, type TransactionEditRepository } from "../service/transaction-edit.service";

function createRepository(): TransactionEditRepository {
  return {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("TransactionEditService.deleteTransaction", () => {
  it("deletes a transaction for valid identifiers", async () => {
    const deleted = { id: 7, userId: 1 };
    const repository = createRepository();
    vi.mocked(repository.delete).mockResolvedValue(deleted as never);
    const service = new TransactionEditService(repository);

    const result = await service.deleteTransaction(1, 7);

    expect(repository.delete).toHaveBeenCalledWith(1, 7);
    expect(result).toBe(deleted);
  });

  it("rejects invalid identifiers", async () => {
    const repository = createRepository();
    const service = new TransactionEditService(repository);

    await expect(service.deleteTransaction(0, 7)).rejects.toThrow("Người dùng không hợp lệ.");
    await expect(service.deleteTransaction(1, 0)).rejects.toThrow("Giao dịch không hợp lệ.");
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

describe("TransactionEditService.updateTransaction", () => {
  it("rejects invalid update input before touching the repository", async () => {
    const repository = createRepository();
    const service = new TransactionEditService(repository);

    await expect(service.updateTransaction({
      userId: 0,
      transactionId: 7,
      amount: 100000,
      walletId: 1,
      categoryId: 1,
      note: null,
    })).rejects.toThrow("Người dùng không hợp lệ.");

    await expect(service.updateTransaction({
      userId: 1,
      transactionId: 0,
      amount: 100000,
      walletId: 1,
      categoryId: 1,
      note: null,
    })).rejects.toThrow("Giao dịch không hợp lệ.");

    await expect(service.updateTransaction({
      userId: 1,
      transactionId: 7,
      amount: 0,
      walletId: 1,
      categoryId: 1,
      note: null,
    })).rejects.toThrow("Vui lòng nhập số tiền hợp lệ.");

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("trims note before updating", async () => {
    const updated = { id: 7, userId: 1 };
    const repository = createRepository();
    vi.mocked(repository.update).mockResolvedValue(updated as never);
    const service = new TransactionEditService(repository);

    const result = await service.updateTransaction({
      userId: 1,
      transactionId: 7,
      amount: 100000,
      walletId: 2,
      categoryId: 3,
      note: "  Ăn trưa  ",
    });

    expect(repository.update).toHaveBeenCalledWith({
      userId: 1,
      transactionId: 7,
      amount: 100000,
      walletId: 2,
      categoryId: 3,
      note: "Ăn trưa",
    });
    expect(result).toBe(updated);
  });
});
