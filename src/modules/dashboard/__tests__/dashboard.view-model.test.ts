import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardViewModel } from "../viewmodel/use-dashboard-view-model";

const getUserInfo = vi.fn();
const load = vi.fn();

vi.mock("@/lib/_core/auth", () => ({ getUserInfo }));
vi.mock("expo-router", () => ({ useFocusEffect: (callback: () => void) => callback() }));
vi.mock("../dashboard.factory", () => ({
  createDashboardDependencies: () => ({ dashboardService: { load } }),
}));

describe("useDashboardViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads dashboard data through the service", async () => {
    const data = { totalBalance: 100, currentMonth: {}, previousMonth: {}, recentTransactions: [], monthLabel: "tháng 10" };
    getUserInfo.mockResolvedValue({ id: 1 });
    load.mockResolvedValue(data);

    const { result } = renderHook(() => useDashboardViewModel());

    await waitFor(() => expect(result.current.data).toEqual(data));
    expect(load).toHaveBeenCalledWith(1);
  });

  it("clears data when there is no authenticated user", async () => {
    getUserInfo.mockResolvedValue(null);
    const { result } = renderHook(() => useDashboardViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });
});
