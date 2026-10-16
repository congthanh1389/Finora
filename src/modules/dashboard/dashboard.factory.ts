import { DeviceDashboardRepository } from "./repository/device-dashboard.repository";
import { DashboardService } from "./service/dashboard.service";

export function createDashboardDependencies() {
  const dashboardRepository = new DeviceDashboardRepository();
  const dashboardService = new DashboardService(dashboardRepository);

  return { dashboardRepository, dashboardService };
}
