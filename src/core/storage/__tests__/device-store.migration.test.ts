import { beforeEach, describe, expect, it, vi } from "vitest";

const getFirstAsync = vi.fn();
const runAsync = vi.fn();
const execAsync = vi.fn();

vi.mock("expo-sqlite", () => ({
  openDatabaseAsync: vi.fn(async () => ({
    getFirstAsync,
    getAllAsync: vi.fn(),
    runAsync,
    execAsync,
    withTransactionAsync: vi.fn(),
  })),
}));

vi.mock("react-native", () => ({
  DeviceEventEmitter: {
    emit: vi.fn(),
  },
}));

describe("device storage migrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFirstAsync.mockResolvedValue({ user_version: 4 });
  });

  it("does not archive categories based on their names when migrating version 4 to 5", async () => {
    const { initializeDeviceStorage } = await import("../device-store");

    await initializeDeviceStorage();

    expect(runAsync).not.toHaveBeenCalled();
    expect(execAsync).toHaveBeenCalledWith("PRAGMA user_version = 5;");
    expect(execAsync).toHaveBeenCalledWith("PRAGMA user_version = 11;");
  });
});
