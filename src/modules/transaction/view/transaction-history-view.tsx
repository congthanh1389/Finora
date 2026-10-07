import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { CategoryIcon } from "@/components/ui/category-icons";
import { resolveCategoryIconName } from "../../category/utils/category-icon-resolver";
import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { DeviceTransactionRepository } from "../repository/device-transaction.repository";
import { DeviceWalletRepository } from "../../wallet/repository/device-wallet.repository";
import { CategoryRepository } from "../../category/repository/category.repository";
import type { WalletType } from "../../wallet/types/wallet.types";
import type { Transaction, Wallet } from "../../../../drizzle/schema";
import { TransactionEditService } from "../service/transaction-edit.service";
import { DeviceTransactionEditRepository } from "../repository/device-transaction-edit.repository";
import { DeviceTransactionSummaryRepository } from "../repository/device-transaction-summary.repository";
import { TransactionSummaryService } from "../service/transaction-summary.service";
import type { TransactionSummaryResult } from "../types/transaction-summary.types";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

const walletTypeLabels: Record<WalletType, string> = {
  cash: "Tiền mặt",
  bank: "Ngân hàng",
  ewallet: "Ví điện tử",
  credit_card: "Thẻ tín dụng",
  savings: "Tiết kiệm",
  investment: "Đầu tư",
  other_asset: "Tài sản khác",
  receivable: "Khoản phải thu",
  payable: "Khoản phải trả",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

type TransactionFilter = "all" | "income" | "expense" | "transfer";

export function TransactionHistoryView() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<CategoryRepository["listByUser"]>>>([]);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionFilter>("all");
  const [periodKey, setPeriodKey] = useState<"today" | "7days" | "month" | "lastMonth" | "3months" | "year" | "custom">("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [summary, setSummary] = useState<TransactionSummaryResult | null>(null);

  const summaryRepository = useMemo(() => new DeviceTransactionSummaryRepository(), []);
  const summaryService = useMemo(() => new TransactionSummaryService(summaryRepository), [summaryRepository]);

  const transactionRepository = useMemo(() => new DeviceTransactionRepository(), []);
  const walletRepository = useMemo(() => new DeviceWalletRepository(), []);
  const categoryRepository = useMemo(() => new CategoryRepository(), []);
  const editRepository = useMemo(() => new DeviceTransactionEditRepository(), []);
  const editService = useMemo(() => new TransactionEditService(editRepository), [editRepository]);
  const walletMap = useMemo(() => new Map(wallets.map((wallet) => [wallet.id, wallet])), [wallets]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const period = useMemo(() => {
    const now = new Date();
    if (periodKey === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    if (periodKey === "7days") return TransactionSummaryService.daysAgo(7, now);
    if (periodKey === "year") return TransactionSummaryService.year(now);
    if (periodKey === "lastMonth") {
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    }
    if (periodKey === "custom") {
      const start = new Date(customStart + "T00:00:00");
      const end = new Date(customEnd + "T00:00:00");
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return null;
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    return TransactionSummaryService.currentMonth(now);
  }, [periodKey, customStart, customEnd]);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const user = await Auth.getUserInfo();
        if (!user || !period) {
          if (active) setSummary(null);
          return;
        }
        const result = await summaryService.getSummary(user.id, period.start, period.end, typeFilter);
        if (active) setSummary(result);
      } catch {
        if (active) setSummary(null);
      }
    }

    void loadSummary();
    return () => {
      active = false;
    };
  }, [summaryService, typeFilter, period]);


  useEffect(() => {
    let active = true;

    async function loadReferenceData() {
      try {
        const user = await Auth.getUserInfo();
        if (!user) {
          if (active) {
            setWallets([]);
            setCategories([]);
          }
          return;
        }

        const [walletData, categoryData] = await Promise.all([
          walletRepository.listByUser(user.id),
          categoryRepository.listByUser(user.id),
        ]);

        if (active) {
          setWallets(walletData);
          setCategories(categoryData);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error("Failed to load reference data"));
        }
      }
    }

    void loadReferenceData();
    return () => {
      active = false;
    };
  }, [walletRepository, categoryRepository]);

  useEffect(() => {
    let active = true;

    async function loadFirstPage() {
      try {
        setLoading(true);
        setError(null);
        setTransactions([]);
        setHasMore(false);

        const user = await Auth.getUserInfo();
        if (!user) return;

        if (!period) { setSummary(null); return; }
        const page = await transactionRepository.listHistoryPage(user.id, 0, typeFilter, 50, period.start, period.end);
        if (active) {
          setTransactions(page.transactions);
          setHasMore(page.hasMore);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error("Failed to load transactions"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFirstPage();
    return () => {
      active = false;
    };
  }, [transactionRepository, typeFilter, period]);

  async function loadMore() {
    if (isLoading || isLoadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const user = await Auth.getUserInfo();
      if (!user) return;

      if (!period) return;
      const page = await transactionRepository.listHistoryPage(user.id, transactions.length, typeFilter, 50, period.start, period.end);
      setTransactions((current) => [...current, ...page.transactions]);
      setHasMore(page.hasMore);
    } catch (err) {
      Alert.alert("Không thể tải thêm", err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-4 px-5 pt-4">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Text className="text-2xl text-[#475569]">‹</Text>
            </Pressable>
            <View className="ml-3 flex-1">
              <Text className="text-[24px] font-bold text-[#0F2A5F]">Tất cả giao dịch</Text>
              <Text className="mt-1 text-xs text-[#64748B]">Các giao dịch đã lưu trên thiết bị</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable onPress={() => router.push("/transaction/transfer")} className="rounded-full bg-[#0F2A5F] px-4 py-2">
                <Text className="text-xs font-bold text-white">Chuyển tiền</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/transaction/new")} className="rounded-full bg-[#22B8A8] px-4 py-2">
                <Text className="text-xs font-bold text-white">+ Giao dịch</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row rounded-2xl bg-[#E2E8F0] p-1">
            {([
              ["all", "Tất cả"],
              ["income", "Thu"],
              ["expense", "Chi"],
              ["transfer", "Chuyển"],
            ] as const).map(([value, label]) => (
              <Pressable key={value} onPress={() => setTypeFilter(value)} className="flex-1 rounded-xl px-2 py-2.5" style={{ backgroundColor: typeFilter === value ? "#0F2A5F" : "transparent" }}>
                <Text className={"text-center text-xs font-bold " + (typeFilter === value ? "text-white" : "text-[#64748B]")}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-4">
            <Text className="text-base font-bold text-[#0F2A5F]">Tổng quan giao dịch</Text>
            <View className="mt-3 flex-row gap-2">
              {[
                ["today", "Hôm nay"], ["7days", "7 ngày"], ["month", "Tháng này"],
                ["lastMonth", "Tháng trước"], ["year", "Năm nay"],
              ].map(([key, label]) => (
                <Pressable key={key} onPress={() => setPeriodKey(key as typeof periodKey)} className="rounded-full bg-[#F1F5F9] px-3 py-2">
                  <Text className={"text-xs font-semibold " + (periodKey === key ? "text-[#0F766E]" : "text-[#64748B]")}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setPeriodKey("custom")} className="mt-2 self-start rounded-full bg-[#E6FFFA] px-3 py-2">
              <Text className="text-xs font-bold text-[#0F766E]">Khoảng thời gian tùy chọn</Text>
            </Pressable>
            {periodKey === "custom" ? (
              <View className="mt-3 flex-row gap-2">
                <TextInput value={customStart} onChangeText={setCustomStart} placeholder="YYYY-MM-DD" className="flex-1 rounded-xl border border-[#CBD5E1] px-3 py-2 text-sm" />
                <TextInput value={customEnd} onChangeText={setCustomEnd} placeholder="YYYY-MM-DD" className="flex-1 rounded-xl border border-[#CBD5E1] px-3 py-2 text-sm" />
              </View>
            ) : null}
            {summary ? (
              <View className="mt-4 rounded-2xl bg-[#F8FAFC] p-4">
                <Text className="text-xs font-semibold text-[#64748B]">
                  {typeFilter === "all"
                    ? "Tổng tất cả"
                    : typeFilter === "income"
                      ? "Tổng thu"
                      : typeFilter === "expense"
                        ? "Tổng chi"
                        : "Tổng chuyển tiền"}
                  {": "}
                  <Text className="text-xl font-extrabold text-[#22B8A8]">
                    {formatVnd(summary.totals.totalAmount)}
                  </Text>
                </Text>
                <Text className="mt-1 text-xs text-[#64748B]">
                  {summary.totals.transactionCount} giao dịch
                </Text>
              </View>
            ) : periodKey === "custom" && customStart && customEnd ? (
              <Text className="mt-3 text-xs text-[#BE123C]">Khoảng ngày không hợp lệ.</Text>
            ) : null}
          </View>

          {isLoading ? (
            <View className="items-center rounded-3xl border border-[#E2E8F0] bg-white py-12">
              <ActivityIndicator />
              <Text className="mt-3 text-sm text-[#64748B]">Đang tải giao dịch...</Text>
            </View>
          ) : error ? (
            <View className="rounded-3xl border border-[#FECACA] bg-white p-5">
              <Text className="text-base font-bold text-[#991B1B]">Không thể tải giao dịch</Text>
              <Text className="mt-1 text-sm text-[#64748B]">Vui lòng thử lại.</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="items-center rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12">
              <FinoraMockupIcon name="07_navigation_transactions" size={52} />
              <Text className="mt-4 text-lg font-bold text-[#0F2A5F]">Chưa có giao dịch</Text>
              <Text className="mt-1 text-center text-sm text-[#64748B]">Hãy tạo khoản thu hoặc khoản chi đầu tiên.</Text>
              <Pressable onPress={() => router.push("/transaction/new")} className="mt-5 rounded-full bg-[#22B8A8] px-6 py-3">
                <Text className="font-bold text-white">Thêm giao dịch</Text>
              </Pressable>
            </View>
          ) : (
            <View className="rounded-3xl border border-[#E2E8F0] bg-white p-4">
              {transactions.map((transaction, index) => {
                const isTransfer = transaction.type === "transfer";
                const isIncome = transaction.type === "income";
                const wallet = transaction.walletId == null ? undefined : walletMap.get(transaction.walletId);
                const sourceWallet = transaction.sourceWalletId == null ? undefined : walletMap.get(transaction.sourceWalletId);
                const destinationWallet = transaction.destinationWalletId == null ? undefined : walletMap.get(transaction.destinationWalletId);
                const category = transaction.categoryId == null ? undefined : categoryMap.get(transaction.categoryId);
                return (
                  <View key={transaction.id} className={"flex-row items-center py-4 " + (index !== transactions.length - 1 ? "border-b border-[#EEF2F7]" : "")}>
                    <View className={"h-11 w-11 items-center justify-center rounded-xl " + (isTransfer ? "bg-[#EFF6FF]" : isIncome ? "bg-[#ECFDF5]" : "bg-[#FFF1F2]")}>
                      {isTransfer ? <FinoraMockupIcon name="01_finance_wallet" size={28} /> : <CategoryIcon name={resolveCategoryIconName(category?.icon)} size={28} />}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-[#0F2A5F]">
                        {isTransfer ? (transaction.note || "Chuyển tiền") : (category?.name || (isIncome ? "Khoản thu" : "Khoản chi"))}
                      </Text>
                      <Text className="mt-1 text-xs text-[#64748B]">
                        {isTransfer
                          ? (sourceWallet?.name || "Ví nguồn") + " → " + (destinationWallet?.name || "Ví nhận")
                          : (wallet?.name || "Ví") + " · " + (wallet ? walletTypeLabels[wallet.type] : "Không rõ loại ví")}
                      </Text>
                      <Text className="mt-1 text-[11px] text-[#94A3B8]">{formatDate(transaction.occurredAt)}</Text>
                    </View>
                    <View className="items-end gap-2">
                      <Text className={"text-sm font-bold " + (isTransfer ? "text-[#0F2A5F]" : isIncome ? "text-[#22B8A8]" : "text-[#E11D48]")}>
                        {isTransfer ? "" : isIncome ? "+" : "−"}{formatVnd(transaction.amount)}
                      </Text>
                      <View className="flex-row gap-2">
                        {!isTransfer ? (
                          <Pressable onPress={() => router.push(`/transaction/edit?id=${transaction.id}`)} className="rounded-full bg-[#E6FFFA] px-3 py-1.5">
                            <Text className="text-xs font-bold text-[#0F766E]">Sửa</Text>
                          </Pressable>
                        ) : null}
                        <Pressable
                          onPress={() => {
                            Alert.alert(
                              "Xóa giao dịch",
                              "Bạn có chắc muốn xóa giao dịch này không?",
                              [
                                { text: "Hủy", style: "cancel" },
                                {
                                  text: "Xóa",
                                  style: "destructive",
                                  onPress: async () => {
                                    try {
                                      const user = await Auth.getUserInfo();
                                      if (!user) {
                                        Alert.alert("Không thể xóa", "Không tìm thấy người dùng hiện tại.");
                                        return;
                                      }
                                      await editService.deleteTransaction(user.id, transaction.id);
                                      setTransactions((current) => current.filter((item) => item.id !== transaction.id));
                                    } catch (err) {
                                      Alert.alert(
                                        "Không thể xóa",
                                        err instanceof Error ? err.message : "Đã xảy ra lỗi.",
                                      );
                                    }
                                  },
                                },
                              ],
                            );
                          }}
                          className="rounded-full bg-[#FFF1F2] px-3 py-1.5"
                        >
                          <Text className="text-xs font-bold text-[#BE123C]">Xóa</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}

              {hasMore ? (
                <Pressable onPress={() => void loadMore()} disabled={isLoadingMore} className="mt-4 items-center rounded-2xl bg-[#F1F5F9] py-3">
                  {isLoadingMore ? <ActivityIndicator /> : <Text className="text-sm font-bold text-[#0F766E]">Tải thêm giao dịch</Text>}
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
