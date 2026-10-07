import { DeviceReportRepository } from "./repository/device-report.repository";
import { ReportService } from "./service/report.service";

export function createReportDependencies() {
  const reportRepository = new DeviceReportRepository();
  const reportService = new ReportService(reportRepository);

  return { reportRepository, reportService };
}
