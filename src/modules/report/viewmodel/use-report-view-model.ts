import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type {
  ReportCustomRange,
  ReportPeriod,
  ReportSnapshot,
} from "../model/report.types";
import { createReportDependencies } from "../report.factory";

export function useReportViewModel(
  service?: ReturnType<typeof createReportDependencies>["reportService"],
) {
  const dependencies = useMemo(() => createReportDependencies(), []);
  const reportService = service ?? dependencies.reportService;
  const [data, setData] = useState<ReportSnapshot | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [customRange, setCustomRange] = useState<ReportCustomRange | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (period === "custom" && !customRange) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const user = await Auth.getUserInfo();
      if (!user) {
        setData(null);
        return;
      }
      setData(await reportService.getReport(user.id, period, new Date(), customRange ?? undefined));
    } finally {
      setLoading(false);
    }
  }, [customRange, period, reportService]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const selectPeriod = useCallback((nextPeriod: ReportPeriod) => {
    setPeriod(nextPeriod);
    if (nextPeriod !== "custom") {
      setCustomRange(null);
    }
  }, []);

  return {
    data,
    period,
    setPeriod: selectPeriod,
    customRange,
    setCustomRange,
    loading,
    reload: load,
  };
}
