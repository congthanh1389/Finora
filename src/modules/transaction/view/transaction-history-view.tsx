import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";

import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { CategoryIcon } from "@/components/ui/category-icons";
import { resolveCategoryIconName } from "../../category/utils/category-icon-resolver";
import { ScreenContainer } from "@/components/screen-container";
import type { WalletType } from "../../wallet/types/wallet.types";
import { useTransactionHistoryViewModel } from "../viewmodel/use-transaction-history-view-model";
import type { Transaction } from "../../../../drizzle/schema";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function formatAmountInput(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
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


function formatIsoDateForDisplay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Chọn ngày";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseCalendarDate(dateValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return new Date();
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function TransactionDatePicker({
  visible,
  value,
  title,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  title: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const [monthShown, setMonthShown] = useState(() => {
    const selected = parseCalendarDate(value);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });


  const firstWeekday = (new Date(monthShown.getFullYear(), monthShown.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(monthShown.getFullYear(), monthShown.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(0), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(0);
  const monthTitle = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(monthShown);
  const selectedDate = parseCalendarDate(value);
  const selectedIsInMonth = selectedDate.getFullYear() === monthShown.getFullYear() && selectedDate.getMonth() === monthShown.getMonth();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="w-full rounded-3xl bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">{title}</Text>
          <View className="mt-4 flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Tháng trước"
              onPress={() => setMonthShown((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]"
            >
              <Text className="text-xl text-[#334155]">‹</Text>
            </Pressable>
            <Text className="text-base font-bold capitalize text-[#0F2A5F]">{monthTitle}</Text>
            <Pressable
              accessibilityLabel="Tháng sau"
              onPress={() => setMonthShown((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]"
            >
              <Text className="text-xl text-[#334155]">›</Text>
            </Pressable>
          </View>
          <View className="mt-4 flex-row">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <View key={day} className="flex-1 items-center py-2"><Text className="text-xs font-semibold text-[#64748B]">{day}</Text></View>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {cells.map((day, index) => {
              const isSelected = day !== 0 && selectedIsInMonth && selectedDate.getDate() === day;
              return (
                <View key={`${monthShown.getFullYear()}-${monthShown.getMonth()}-${index}`} className="w-[14.2857%] items-center py-1">
                  {day === 0 ? <View className="h-10 w-10" /> : (
                    <Pressable
                      onPress={() => {
                        const chosen = `${monthShown.getFullYear()}-${String(monthShown.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        onSelect(chosen);
                      }}
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: isSelected ? "#0F766E" : "transparent" }}
                    >
                      <Text className={`text-sm font-semibold ${isSelected ? "text-white" : "text-[#334155]"}`}>{day}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
          <Pressable onPress={onClose} className="mt-4 items-center rounded-xl bg-[#F1F5F9] py-3">
            <Text className="font-semibold text-[#475569]">Đóng lịch</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}


export function TransactionHistoryView() {
  const router = useRouter();
  const {
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
    setTypeFilter,
    setPeriodKey,
    setCustomStart,
    setCustomEnd,
    loadMore,
    deleteTransaction,
    walletFilterId,
    categoryFilterId,
    minAmount,
    maxAmount,
    minAmountInput,
    maxAmountInput,
    setWalletFilterId,
    setCategoryFilterId,
    setMinAmountInput,
    setMaxAmountInput,
    applyAdvancedFilters,
    clearAdvancedFilters,
    hasAdvancedFilters,
  } = useTransactionHistoryViewModel();

  const walletMap = useMemo(() => new Map(wallets.map((wallet) => [wallet.id, wallet])), [wallets]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const visibleCategories = useMemo(() => {
    if (typeFilter === "all") return categories;
    if (typeFilter === "transfer") return [];
    return categories.filter((category) => category.type === typeFilter);
  }, [categories, typeFilter]);
  const listRef = useRef<FlatList<Transaction>>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<"start" | "end" | null>(null);

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

    const renderItem = useCallback(
        ({ item: transaction, index }: { item: Transaction; index: number }) => {
const isTransfer = transaction.type === "transfer";
                const isIncome = transaction.type === "income";
                const wallet = transaction.walletId == null ? undefined : walletMap.get(transaction.walletId);
                const sourceWallet = transaction.sourceWalletId == null ? undefined : walletMap.get(transaction.sourceWalletId);
                const destinationWallet = transaction.destinationWalletId == null ? undefined : walletMap.get(transaction.destinationWalletId);
                const category = transaction.categoryId == null ? undefined : categoryMap.get(transaction.categoryId);
                return (
                  <View className={"mx-5 flex-row items-center bg-white px-4 py-4 " + (index !== transactions.length - 1 ? "border-b border-[#EEF2F7]" : "")}>
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
                                      await deleteTransaction(transaction.id);
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
        },
      [categoryMap, deleteTransaction, router, transactions.length, walletMap],
    );

  return (
    <ScreenContainer className="bg-[#F8FAFC]">

      <FlatList
        ref={listRef}
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={
          <View className="gap-4 px-5 pt-4">
            <View className="flex-row items-center">
              <Pressable onPress={() => { if (router.canGoBack()) router.back(); else router.replace("/(tabs)"); }} className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Text className="text-2xl text-[#475569]">‹</Text>
              </Pressable>
              <View className="ml-3 flex-1">
                <Text className="text-[24px] font-bold text-[#0F2A5F]">Tất cả giao dịch</Text>
                <Text className="mt-1 text-xs text-[#64748B]">Theo dõi thu, chi và chuyển tiền</Text>
              </View>
              <Pressable onPress={() => router.push("/transaction/transfer")} className="mr-2 h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE]">
                <FinoraMockupIcon name="01_finance_wallet" size={22} />
              </Pressable>
              <Pressable onPress={() => router.push("/transaction/new")} className="h-10 w-10 items-center justify-center rounded-xl bg-[#CCFBF1]">
                <Text className="text-2xl font-bold text-[#0F766E]">+</Text>
              </Pressable>
            </View>

            <View className="flex-row rounded-2xl bg-[#E2E8F0] p-1">
              {([
                ["all", "Tất cả"],
                ["income", "Thu"],
                ["expense", "Chi"],
                ["transfer", "Chuyển"],
              ] as const).map(([value, label]) => (
                <Pressable key={value} onPress={() => setTypeFilter(value)} className="flex-1 rounded-xl px-2 py-3" style={{ backgroundColor: typeFilter === value ? "#0F2A5F" : "transparent" }}>
                  <Text className={"text-center text-sm font-bold " + (typeFilter === value ? "text-white" : "text-[#64748B]")}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <View className="rounded-3xl border border-[#E2E8F0] bg-white p-4">
              <Text className="text-sm font-bold" style={{ color: "#8B5CF6" }}>
                {typeFilter === "all" ? "TỔNG TẤT CẢ" : typeFilter === "income" ? "TỔNG THU" : typeFilter === "expense" ? "TỔNG CHI" : "TỔNG CHUYỂN TIỀN"}
              </Text>
              {summary ? (
                <>
                  <Text className="mt-1 text-[28px]" style={{ color: "#0F766E", fontWeight: "900" }}>{formatVnd(summary.totals.totalAmount)}</Text>
                  <Text className="mt-1 text-xs text-[#64748B]">{summary.totals.transactionCount} giao dịch trong kỳ đã chọn</Text>
                </>
              ) : periodKey === "custom" && customStart && customEnd ? (
                <Text className="mt-2 text-xs text-[#BE123C]">Khoảng ngày không hợp lệ.</Text>
              ) : (
                <View className="mt-3"><ActivityIndicator /></View>
              )}

              <View className="mt-4 flex-row flex-wrap gap-2">
                {[
                  ["today", "Hôm nay"], ["7days", "7 ngày"], ["month", "Tháng này"],
                  ["lastMonth", "Tháng trước"], ["year", "Năm nay"],
                ].map(([key, label]) => (
                  <Pressable key={key} onPress={() => setPeriodKey(key as typeof periodKey)} className="rounded-full px-3 py-2" style={{ backgroundColor: periodKey === key ? "#CCFBF1" : "#F1F5F9" }}>
                    <Text className={"text-xs font-semibold " + (periodKey === key ? "text-[#0F766E]" : "text-[#64748B]")}>{label}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => setPeriodKey("custom")} className="rounded-full px-3 py-2" style={{ backgroundColor: periodKey === "custom" ? "#CCFBF1" : "#F1F5F9" }}>
                  <Text className={"text-xs font-semibold " + (periodKey === "custom" ? "text-[#0F766E]" : "text-[#64748B]")}>Tùy chọn</Text>
                </Pressable>
              </View>
              {periodKey === "custom" ? (
                <View className="mt-3 gap-3">
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setDatePickerTarget("start")}
                      className="flex-1 rounded-xl border border-[#CBD5E1] bg-white px-3 py-3"
                    >
                      <Text className="text-[11px] font-semibold text-[#64748B]">Từ ngày</Text>
                      <Text className="mt-1 text-sm font-semibold text-[#0F2A5F]">{formatIsoDateForDisplay(customStart)}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setDatePickerTarget("end")}
                      className="flex-1 rounded-xl border border-[#CBD5E1] bg-white px-3 py-3"
                    >
                      <Text className="text-[11px] font-semibold text-[#64748B]">Đến ngày</Text>
                      <Text className="mt-1 text-sm font-semibold text-[#0F2A5F]">{formatIsoDateForDisplay(customEnd)}</Text>
                    </Pressable>
                  </View>
                  <Text className="text-xs text-[#64748B]">Chạm vào ô ngày để mở lịch và chọn ngày.</Text>
                </View>
              ) : null}
            </View>

            <Pressable onPress={() => setShowAdvancedFilters((visible) => !visible)} className="flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5F9]">
                <Text className="text-lg text-[#475569]">☷</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#0F2A5F]">Bộ lọc nâng cao</Text>
                <Text className="mt-1 text-xs text-[#64748B]">
                  {hasAdvancedFilters ? "Đang áp dụng bộ lọc" : "Ví, danh mục và khoảng tiền"}
                </Text>
              </View>
              {hasAdvancedFilters ? <View className="mr-2 rounded-full bg-[#CCFBF1] px-2 py-1"><Text className="text-xs font-bold text-[#0F766E]">Đang lọc</Text></View> : null}
              <Text className="text-lg text-[#64748B]">{showAdvancedFilters ? "⌃" : "⌄"}</Text>
            </Pressable>

            {showAdvancedFilters ? (
              <View className="rounded-3xl border border-[#E2E8F0] bg-white p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-[#0F2A5F]">Điều chỉnh bộ lọc</Text>
                  {hasAdvancedFilters ? (
                    <Pressable onPress={clearAdvancedFilters}><Text className="text-xs font-bold text-[#BE123C]">Xóa lọc</Text></Pressable>
                  ) : null}
                </View>

                <Text className="mt-3 text-xs font-semibold text-[#64748B]">Ví</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => setWalletFilterId(undefined)} className="rounded-full px-3 py-2" style={{ backgroundColor: walletFilterId === undefined ? "#0F2A5F" : "#E2E8F0" }}>
                      <Text className="text-xs font-bold" style={{ color: walletFilterId === undefined ? "#FFFFFF" : "#334155" }}>Tất cả ví</Text>
                    </Pressable>
                    {wallets.map((wallet) => (
                      <Pressable key={wallet.id} onPress={() => setWalletFilterId(wallet.id)} className="rounded-full px-3 py-2" style={{ backgroundColor: walletFilterId === wallet.id ? "#0F2A5F" : "#E2E8F0" }}>
                        <Text className="text-xs font-semibold" style={{ color: walletFilterId === wallet.id ? "#FFFFFF" : "#334155" }}>{wallet.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                <Text className="mt-3 text-xs font-semibold text-[#64748B]">Danh mục</Text>
                {typeFilter === "transfer" ? <Text className="mt-2 text-xs text-[#64748B]">Chuyển tiền không sử dụng danh mục.</Text> : null}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => setCategoryFilterId(undefined)} className="rounded-full px-3 py-2" style={{ backgroundColor: categoryFilterId === undefined ? "#0F2A5F" : "#E2E8F0" }}>
                      <Text className="text-xs font-bold" style={{ color: categoryFilterId === undefined ? "#FFFFFF" : "#334155" }}>Tất cả danh mục</Text>
                    </Pressable>
                    {visibleCategories.map((category) => (
                      <Pressable key={category.id} onPress={() => setCategoryFilterId(category.id)} className="rounded-full px-3 py-2" style={{ backgroundColor: categoryFilterId === category.id ? "#0F2A5F" : "#E2E8F0" }}>
                        <Text className="text-xs font-semibold" style={{ color: categoryFilterId === category.id ? "#FFFFFF" : "#334155" }}>{category.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                <Text className="mt-3 text-xs font-semibold text-[#64748B]">Khoảng tiền</Text>
                <View className="mt-2 flex-row gap-2">
                  <TextInput value={minAmountInput} onChangeText={(value) => setMinAmountInput(formatAmountInput(value))} placeholder="Từ" keyboardType="numeric" className="flex-1 rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-sm" />
                  <TextInput value={maxAmountInput} onChangeText={(value) => setMaxAmountInput(formatAmountInput(value))} placeholder="Đến" keyboardType="numeric" className="flex-1 rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-sm" />
                  <Pressable onPress={applyAdvancedFilters} className="rounded-xl bg-[#0F766E] px-4 py-2.5"><Text className="font-bold text-white">Lọc</Text></Pressable>
                </View>
                {hasAdvancedFilters ? (
                  <Text className="mt-3 text-xs text-[#0F766E]">
                    Đang lọc{walletFilterId !== undefined ? " · theo ví" : ""}{categoryFilterId !== undefined ? " · theo danh mục" : ""}{minAmount !== undefined || maxAmount !== undefined ? " · theo khoảng tiền" : ""}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <Text className="text-base font-bold text-[#0F2A5F]">Danh sách giao dịch</Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="mx-5 items-center rounded-3xl border border-[#E2E8F0] bg-white py-12">
              <ActivityIndicator />
              <Text className="mt-3 text-sm text-[#64748B]">Đang tải giao dịch...</Text>
            </View>
          ) : error ? (
            <View className="mx-5 rounded-3xl border border-[#FECACA] bg-white p-5">
              <Text className="text-base font-bold text-[#991B1B]">Không thể tải giao dịch</Text>
              <Text className="mt-1 text-sm text-[#64748B]">Vui lòng thử lại.</Text>
            </View>
          ) : (
            <View className="mx-5 items-center rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12">
              <FinoraMockupIcon name="07_navigation_transactions" size={52} />
              <Text className="mt-4 text-lg font-bold text-[#0F2A5F]">Chưa có giao dịch</Text>
              <Text className="mt-1 text-center text-sm text-[#64748B]">Hãy tạo khoản thu hoặc khoản chi đầu tiên.</Text>
              <Pressable onPress={() => router.push("/transaction/new")} className="mt-5 rounded-full bg-[#22B8A8] px-6 py-3">
                <Text className="font-bold text-white">Thêm giao dịch</Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          hasMore ? (
            <View className="mx-5 items-center py-5">
              {isLoadingMore ? <ActivityIndicator /> : <Text className="text-xs text-[#64748B]">Đang chuẩn bị thêm giao dịch...</Text>}
            </View>
          ) : (
            <View className="h-8" />
          )
        }
        onEndReached={() => {
          if (!isLoading && !isLoadingMore && hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.5}
        onScroll={(event) => {
          setShowScrollTop(event.nativeEvent.contentOffset.y > 500);
        }}
        scrollEventThrottle={200}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        extraData={{ typeFilter, periodKey, isLoadingMore, walletFilterId, categoryFilterId, minAmount, maxAmount }}
      />
      <TransactionDatePicker
        key={`${datePickerTarget}-${datePickerTarget === "end" ? customEnd : customStart}`}
        visible={datePickerTarget !== null}
        value={datePickerTarget === "end" ? customEnd : customStart}
        title={datePickerTarget === "end" ? "Chọn ngày kết thúc" : "Chọn ngày bắt đầu"}
        onSelect={(date) => {
          if (datePickerTarget === "end") setCustomEnd(date);
          else setCustomStart(date);
          setDatePickerTarget(null);
        }}
        onClose={() => setDatePickerTarget(null)}
      />
      {showScrollTop ? (
        <Pressable onPress={scrollToTop} className="absolute bottom-5 right-5 h-12 w-12 items-center justify-center rounded-full bg-[#0F2A5F] shadow-lg">
          <Text className="text-xl font-bold text-white">↑</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}
