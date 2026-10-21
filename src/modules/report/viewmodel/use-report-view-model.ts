import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type {
  ReportCustomRange,
  ReportPeriod,
  ReportSnapshot,
} from "../model/report.types";
import { createReportDependencies } from "../report.factory";
import { getFinancialPreferences } from "@/src/core/settings/financial-preferences";

export function useReportViewModel(
  service?: ReturnType<typeof createReportDependencies>["reportService"],
) {
  const dependencies = useMemo(() => createReportDependencies(), []);
  const reportService = service ?? dependencies.reportService;
  const [data, setData] = useState<ReportSnapshot | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [customRange, setCustomRange] = useState<ReportCustomRange | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Auth.getUserInfo().then(async (user) => {
      if (!user) return;
      const preferences = await getFinancialPreferences(user.id);
      if (!active) return;
      setPeriod(preferences.defaultReportPeriod);
      setWeekStartsOn(preferences.weekStartsOn);
    }).catch(() => undefined).finally(() => {
      if (active) setPreferencesLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const load = useCallback(async () => {
    if (!preferencesLoaded) return;
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
      setData(await reportService.getReport(user.id, period, new Date(), customRange ?? undefined, weekStartsOn));
    } finally {
      setLoading(false);
    }
  }, [customRange, period, preferencesLoaded, reportService, weekStartsOn]);

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
