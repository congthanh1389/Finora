import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type { DashboardData } from "../types/dashboard.types";
import { createDashboardDependencies } from "../dashboard.factory";

export function useDashboardViewModel() {
  const dependencies = useMemo(() => createDashboardDependencies(), []);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await Auth.getUserInfo();
      if (!user) {
        setData(null);
        return;
      }
      setData(await dependencies.dashboardService.load(user.id));
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err : new Error("Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  }, [dependencies.dashboardService]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { data, loading, error, reload: load };
}
