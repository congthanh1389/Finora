import { describe, expect, it, vi } from "vitest";
import { DashboardService } from "../service/dashboard.service";

describe("DashboardService", () => {
  it("rejects invalid user ids", async () => {
    const service = new DashboardService({ getDashboardData: vi.fn() } as never);
    await expect(service.load(0)).rejects.toThrow("Invalid user id");
  });

  it("returns the repository dashboard model", async () => {
    const data = {
      totalBalance: 1000000,
      currentMonth: { income: 500000, expense: 100000, transfer: 200000, netCashflow: 400000 },
      previousMonth: { income: 400000, expense: 200000, transfer: 0, netCashflow: 200000 },
      recentTransactions: [],
      monthLabel: "tháng 10",
    };
    const repository = { getDashboardData: vi.fn().mockResolvedValue(data) };
    const service = new DashboardService(repository as never);

    await expect(service.load(1)).resolves.toEqual(data);
    expect(repository.getDashboardData).toHaveBeenCalledWith(1);
  });
});
