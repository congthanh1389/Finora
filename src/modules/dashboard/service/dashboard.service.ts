/* eslint-disable import/namespace */
import { DeviceDashboardRepository } from "../repository/device-dashboard.repository";

export class DashboardService {
  constructor(private readonly repository = new DeviceDashboardRepository()) {}

  async load(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid user id");
    return this.repository.getDashboardData(userId);
  }
}
