import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import {
  ReportService,
  type ReportPeriod,
} from "../service/report.service";
import type { ReportData } from "../repository/device-report.repository";

const defaultReportService = new ReportService();

export function useReportViewModel(service = defaultReportService) {
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

      setData(await service.getReport(user.id, period));
    } finally {
      setLoading(false);
    }
  }, [period, service]);

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
