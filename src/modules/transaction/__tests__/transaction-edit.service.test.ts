import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteDeviceTransaction, updateDeviceTransaction } from "../repository/device-transaction-edit.repository";
import { TransactionEditService } from "../service/transaction-edit.service";

vi.mock("../repository/device-transaction-edit.repository", () => ({
  deleteDeviceTransaction: vi.fn(),
  getDeviceTransaction: vi.fn(),
  updateDeviceTransaction: vi.fn(),
}));

describe("TransactionEditService.deleteTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a transaction for valid identifiers", async () => {
    const deleted = { id: 7, userId: 1 };
    vi.mocked(deleteDeviceTransaction).mockResolvedValue(deleted as never);

    const service = new TransactionEditService();
    const result = await service.deleteTransaction(1, 7);

    expect(deleteDeviceTransaction).toHaveBeenCalledWith(1, 7);
    expect(result).toBe(deleted);
  });

  it("rejects invalid identifiers", async () => {
    const service = new TransactionEditService();

    await expect(service.deleteTransaction(0, 7)).rejects.toThrow("Người dùng không hợp lệ.");
    await expect(service.deleteTransaction(1, 0)).rejects.toThrow("Giao dịch không hợp lệ.");
    expect(deleteDeviceTransaction).not.toHaveBeenCalled();
  });
});


describe("TransactionEditService.updateTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid update input before touching the repository", async () => {
    const service = new TransactionEditService();

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

    expect(vi.mocked(updateDeviceTransaction)).not.toHaveBeenCalled();
  });

  it("trims note before updating", async () => {
    const updated = { id: 7, userId: 1 };
    vi.mocked(updateDeviceTransaction).mockResolvedValue(updated as never);

    const service = new TransactionEditService();
    const result = await service.updateTransaction({
      userId: 1,
      transactionId: 7,
      amount: 100000,
      walletId: 2,
      categoryId: 3,
      note: "  Ăn trưa  ",
    });

    expect(updateDeviceTransaction).toHaveBeenCalledWith({
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
