import { useCallback, useEffect, useMemo, useState } from "react";
import * as Auth from "@/lib/_core/auth";
import { createTransactionDependencies } from "../transaction.factory";
import type { Transaction } from "../../../../drizzle/schema";
import type { WalletSummary } from "../../wallet/types/wallet.types";
import type { TransactionSummaryResult } from "../types/transaction-summary.types";
import type { TransactionType } from "../types/transaction.types";
import { TransactionSummaryService } from "../service/transaction-summary.service";

type TransactionFilter = "all" | TransactionType;
type PeriodKey = "today" | "7days" | "month" | "lastMonth" | "3months" | "year" | "custom";

const PAGE_SIZE = 50;

function calculatePeriod(
  periodKey: PeriodKey,
  customStart: string,
  customEnd: string,
  now = new Date(),
): { start: Date; end: Date } | null {
  if (periodKey === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (periodKey === "7days") {
    return TransactionSummaryService.daysAgo(7, now);
  }

  if (periodKey === "year") {
    return TransactionSummaryService.year(now);
  }

  if (periodKey === "lastMonth") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }

  if (periodKey === "custom") {
    const start = new Date(customStart + "T00:00:00");
    const end = new Date(customEnd + "T00:00:00");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return null;
    }
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  return TransactionSummaryService.currentMonth(now);
}

export function useTransactionHistoryViewModel() {
  const dependencies = useMemo(() => createTransactionDependencies(), []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof dependencies.categoryService.listCategories>>>([]);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionFilter>("all");
  const [periodKey, setPeriodKey] = useState<PeriodKey>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [summary, setSummary] = useState<TransactionSummaryResult | null>(null);

  const period = useMemo(
    () => calculatePeriod(periodKey, customStart, customEnd),
    [periodKey, customStart, customEnd],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTransactions([]);
    setHasMore(false);

    try {
      const user = await Auth.getUserInfo();
      if (!user) {
        setWallets([]);
        setCategories([]);
        setSummary(null);
        return;
      }

      if (!period) {
        setSummary(null);
        return;
      }

      const [page, references, summaryResult] = await Promise.all([
        dependencies.historyService.listPage(
          user.id,
          0,
          typeFilter,
          PAGE_SIZE,
          period.start,
          period.end,
        ),
        dependencies.historyService.loadReferences(user.id),
        dependencies.historyService.getSummary(user.id, period.start, period.end, typeFilter),
      ]);

      setTransactions(page.transactions);
      setHasMore(page.hasMore);
      setWallets(references.wallets);
      setCategories(references.categories);
      setSummary(summaryResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không thể tải giao dịch."));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [dependencies, period, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || !period) return;

    try {
      setLoadingMore(true);
      const user = await Auth.getUserInfo();
      if (!user) return;

      const page = await dependencies.historyService.listPage(
        user.id,
        transactions.length,
        typeFilter,
        PAGE_SIZE,
        period.start,
        period.end,
      );
      setTransactions((current) => [...current, ...page.transactions]);
      setHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [dependencies, hasMore, isLoading, isLoadingMore, period, transactions.length, typeFilter]);

  const deleteTransaction = useCallback(async (transactionId: number) => {
    await dependencies.historyService.deleteTransaction(
      (await Auth.getUserInfo())?.id ?? 0,
      transactionId,
    );
    await load();
  }, [dependencies, load]);

  return {
    transactions,
    wallets,
    categories,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    typeFilter,
    periodKey,
    customStart,
    customEnd,
    summary,
    period,
    setTypeFilter,
    setPeriodKey,
    setCustomStart,
    setCustomEnd,
    loadMore,
    deleteTransaction,
  };
}
