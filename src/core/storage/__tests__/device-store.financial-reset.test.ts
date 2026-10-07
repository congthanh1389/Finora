import { beforeEach, describe, expect, it, vi } from "vitest";

const getFirstAsync = vi.fn();
const getAllAsync = vi.fn();
const runAsync = vi.fn();
const execAsync = vi.fn();
const withTransactionAsync = vi.fn();

vi.mock("expo-sqlite", () => ({
  openDatabaseAsync: vi.fn(async () => ({
    getFirstAsync,
    getAllAsync,
    runAsync,
    execAsync,
    withTransactionAsync: async (callback: () => Promise<void>) => {
      withTransactionAsync();
      await callback();
    },
  })),
}));

vi.mock("react-native", () => ({
  DeviceEventEmitter: {
    emit: vi.fn(),
  },
}));

import { clearDeviceFinancialData } from "../device-store";

describe("clearDeviceFinancialData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFirstAsync.mockResolvedValue({ user_version: 8 });
  });

  it("rejects invalid user ids before touching the database", async () => {
    await expect(clearDeviceFinancialData(0)).rejects.toThrow("Invalid user id.");
    expect(getFirstAsync).not.toHaveBeenCalled();
    expect(withTransactionAsync).not.toHaveBeenCalled();
  });

  it("deletes transactions, budgets, categories and wallets in one transaction", async () => {
    await clearDeviceFinancialData(42);

    expect(withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(runAsync).toHaveBeenNthCalledWith(1, "DELETE FROM transactions WHERE user_id = ?", 42);
    expect(runAsync).toHaveBeenNthCalledWith(2, "DELETE FROM budgets WHERE user_id = ?", 42);
    expect(runAsync).toHaveBeenNthCalledWith(3, "DELETE FROM categories WHERE user_id = ?", 42);
    expect(runAsync).toHaveBeenNthCalledWith(4, "DELETE FROM wallets WHERE user_id = ?", 42);
    expect(runAsync).toHaveBeenCalledTimes(4);
    expect(execAsync).toHaveBeenLastCalledWith("VACUUM");
  });
});
