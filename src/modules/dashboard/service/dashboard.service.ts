import { DeviceDashboardRepository } from "../repository/device-dashboard.repository";

type DashboardRepository = Pick<DeviceDashboardRepository, "getDashboardData">;

export class DashboardService {
  private readonly repository: DashboardRepository;

  constructor(repository?: DashboardRepository) {
    this.repository = repository ?? new DeviceDashboardRepository();
  }

  async load(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    return this.repository.getDashboardData(userId);
  }
}
