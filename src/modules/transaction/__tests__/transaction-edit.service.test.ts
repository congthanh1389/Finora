import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteDeviceTransaction } from "../repository/device-transaction-edit.repository";
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
