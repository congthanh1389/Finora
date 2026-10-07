export interface DashboardRepository {
  getDashboardData(userId: number): Promise<unknown>;
}

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async load(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    return this.repository.getDashboardData(userId);
  }
}
