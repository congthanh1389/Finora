import { useCallback, useEffect, useMemo, useState } from "react";
import * as Auth from "@/lib/_core/auth";
import { createTransactionDependencies } from "../transaction.factory";
import type { Transaction } from "../../../../drizzle/schema";
import type { WalletSummary } from "../../wallet/types/wallet.types";
import type { TransactionSummaryResult } from "../types/transaction-summary.types";
import type { TransactionType } from "../types/transaction.types";

type TransactionFilter = "all" | TransactionType;
type PeriodKey = "today" | "7days" | "month" | "lastMonth" | "3months" | "year" | "custom";
const PAGE_SIZE = 50;

function getPeriod(periodKey: PeriodKey, customStart: string, customEnd: string) {
  const now = new Date();

  if (periodKey === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (periodKey === "7days") return createTransactionDependencies().summaryService.constructor === undefined ? null : undefined;
  return null;
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
  const [period, setPeriod] = useState<{ start: Date; end: Date } | null>(null);

  const calculatePeriod = useCallback((key: PeriodKey, startText: string, endText: string) => {
    const now = new Date();

    if (key === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }

    if (key === "7days") return dependencies.summaryService.constructor === undefined ? null : {
      start: dependencies.summaryService.constructor === undefined ? now : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    };

    if (key === "year") return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear() + 1, 0, 1),
    };

    if (key === "lastMonth") return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 1),
    };

    if (key === "custom") {
      const start = new Date(startText + "T00:00:00");
      const end = new Date(endText + "T00:00:00");
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return null;
      end.setDate(end.getDate() + 1);
      return { start, end };
    }

    return dependencies.summaryService.constructor === undefined ? null : {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }, [dependencies]);

  useEffect(() => {
    setPeriod(calculatePeriod(periodKey, customStart, customEnd));
  }, [calculatePeriod, periodKey, customStart, customEnd]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTransactions([]);
    setHasMore(false);

    try {
      const user = await Auth.getUserInfo();
      if (!user || !period) {
        setSummary(null);
        return;
      }

      const [page, references, summaryResult] = await Promise.all([
        dependencies.transactionRepository.listHistoryPage(user.id, 0, typeFilter, PAGE_SIZE, period.start, period.end),
        dependencies.categoryService.listCategories(user.id).then(async (categoriesResult) => ({
          categories: categoriesResult,
          wallets: (await dependencies.walletService.listWallets(user.id)).filter((wallet) => !wallet.isArchived),
        })),
        dependencies.summaryService.getSummary(user.id, period.start, period.end, typeFilter),
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

      const page = await dependencies.transactionRepository.listHistoryPage(
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
    const user = await Auth.getUserInfo();
    if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
    await dependencies.editService.deleteTransaction(user.id, transactionId);
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
