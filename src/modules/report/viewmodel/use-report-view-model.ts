import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import { type ReportPeriod } from "../service/report.service";
import { createReportDependencies } from "../report.factory";
import type { ReportData } from "../repository/device-report.repository";

export function useReportViewModel(service?: ReturnType<typeof createReportDependencies>["reportService"]) {
  const dependencies = useMemo(() => createReportDependencies(), []);
  const reportService = service ?? dependencies.reportService;
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("current");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = await Auth.getUserInfo();
      if (!user) {
        setData(null);
        return;
      }

      setData(await reportService.getReport(user.id, period));
    } finally {
      setLoading(false);
    }
  }, [period, reportService]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  return {
    data,
    period,
    setPeriod,
    loading,
    reload: load,
  };
}
