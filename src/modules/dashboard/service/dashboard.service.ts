import type { DashboardData } from "../types/dashboard.types";

export interface DashboardRepository {
  getDashboardData(userId: number): Promise<DashboardData>;
}

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async load(userId: number): Promise<DashboardData> {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    return this.repository.getDashboardData(userId);
  }
}
