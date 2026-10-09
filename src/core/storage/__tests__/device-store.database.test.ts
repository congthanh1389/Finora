import { beforeEach, describe, expect, it, vi } from "vitest";

const { openDatabaseAsync } = vi.hoisted(() => ({
  openDatabaseAsync: vi.fn(),
}));

vi.mock("expo-sqlite", () => ({ openDatabaseAsync }));

vi.mock("react-native", () => ({
  DeviceEventEmitter: { emit: vi.fn() },
}));

describe("device database connection", () => {
  beforeEach(() => {
    vi.resetModules();
    openDatabaseAsync.mockReset();
  });

  it("retries opening the database after the first attempt fails", async () => {
    const database = { getFirstAsync: vi.fn() };
    openDatabaseAsync
      .mockRejectedValueOnce(new Error("temporary open failure"))
      .mockResolvedValueOnce(database);

    const { getDeviceDatabase } = await import("../device-store");

    await expect(getDeviceDatabase()).rejects.toThrow("temporary open failure");
    await expect(getDeviceDatabase()).resolves.toBe(database);
    expect(openDatabaseAsync).toHaveBeenCalledTimes(2);
  });
});
