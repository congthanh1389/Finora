import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import type { ReportPeriod } from "@/src/modules/report/model/report.types";
import { CalendarDatePicker, formatCalendarDate } from "@/components/ui/calendar-date-picker";
import { useReportViewModel } from "@/src/modules/report/viewmodel/use-report-view-model";
import { useSuggestionViewModel } from "@/src/modules/suggestion/viewmodel/use-suggestion-view-model";
import { SuggestionCard } from "@/src/modules/suggestion/components/suggestion-card";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " ₫";
const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const dateToIso = (date: Date | null) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";

const walletTypeLabels: Record<string, string> = {
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

const periodLabels: Record<ReportPeriod, string> = {
  today: "Hôm nay",
  week: "7 ngày",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
  custom: "Tùy chọn",
};

const getCashFlowGranularity = (period: ReportPeriod, customRange: { start: Date; end: Date | null } | null) => {
  if (period === "today" || period === "week" || period === "month") return "day";
  if (period === "quarter") return "week";
  if (period === "year") return "month";
  if (!customRange?.start || !customRange.end) return "day";

  const durationDays = Math.round(
    (customRange.end.getTime() - customRange.start.getTime()) / (24 * 60 * 60 * 1000),
  ) + 1;

  if (durationDays <= 31) return "day";
  if (durationDays <= 120) return "week";
  return "month";
};

const cashFlowPointLabel = (date: string, granularity: string) => {
  if (granularity === "month") return `T${Number(date.slice(5, 7))}`;
  if (granularity === "week") return `${date.slice(8)}/${date.slice(5, 7)}`;
  return date.slice(8);
};

export default function ReportsScreen() {
  const params = useLocalSearchParams<{ start?: string | string[]; end?: string | string[] }>();
  const startParam = Array.isArray(params.start) ? params.start[0] : params.start;
  const endParam = Array.isArray(params.end) ? params.end[0] : params.end;
  const initialRange = useMemo(() => {
    if (!startParam || !endParam) return null;

    const parseLocalDate = (value: string): Date | null => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) return null;
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : null;
    };

    const start = parseLocalDate(startParam);
    const end = parseLocalDate(endParam);
    if (!start || !end || end < start) return null;
    return { start, end };
  }, [startParam, endParam]);
  const {
    data,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    loading,
  } = useReportViewModel(undefined, initialRange);
  const suggestions = useSuggestionViewModel(data);
  const [calendarMode, setCalendarMode] = useState<"start" | "end" | null>(null);
  const [draftDate, setDraftDate] = useState<Date | null>(null);

  const maxFlow = useMemo(
    () =>
      Math.max(
        ...(data?.cashFlow ?? []).flatMap((item) => [item.income, item.expense]),
        1,
      ),
    [data],
  );
  const topCategories = data?.categories.slice(0, 5) ?? [];
  const topWallets = data?.wallets ?? [];
  const cashFlowGranularity = getCashFlowGranularity(period, customRange);
  const hasCashFlowActivity = (data?.cashFlow ?? []).some(
    (item) => item.income !== 0 || item.expense !== 0,
  );

  const openCalendar = (mode: "start" | "end") => {
    setDraftDate(mode === "start" ? customRange?.start ?? new Date() : customRange?.end ?? customRange?.start ?? new Date());
    setCalendarMode(mode);
  };

  const selectCalendarDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    const normalized = new Date(year, month - 1, day);

    if (calendarMode === "start") {
      const end = customRange?.end && normalized > customRange.end ? normalized : customRange?.end ?? normalized;
      setCustomRange({ start: normalized, end });
    } else if (calendarMode === "end") {
      const start = customRange?.start ?? normalized;
      if (normalized < start) {
        Alert.alert("Khoảng ngày không hợp lệ", "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
        return;
      }
      setCustomRange({ start, end: normalized });
    }

    setPeriod("custom");
    setCalendarMode(null);
    setDraftDate(null);
  };

  const customRangeReady = Boolean(customRange?.start && customRange.end);

  return (
    <ScreenContainer className="bg-[#EAF9F4] dark:bg-[#10211F]">
      <View pointerEvents="none" className="absolute right-5 top-2 h-24 w-16 items-center opacity-40">
        <View className="h-[72px] w-14 rounded-full bg-[#9BE7D2]" />
        <View className="h-3 w-3 -mt-1 rotate-45 bg-[#9BE7D2]" />
        <View className="h-7 w-px bg-[#67CDB5]" />
      </View>
      <View pointerEvents="none" className="absolute right-20 top-12 h-16 w-10 items-center opacity-25">
        <View className="h-12 w-10 rounded-full bg-[#66D6BD]" />
        <View className="h-2 w-2 -mt-1 rotate-45 bg-[#66D6BD]" />
        <View className="h-5 w-px bg-[#67CDB5]" />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#164F4B" }}>Báo cáo</Text>
        <Text className="mt-1 text-sm text-[#64748B] dark:text-[#A5BCB5]">
          Nhìn nhanh tình hình tài chính của bạn.
        </Text>

        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 4 }}
          >
            {(["today", "week", "month", "quarter", "year"] as ReportPeriod[]).map((key) => {
              const active = period === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setPeriod(key)}
                  className={`rounded-2xl px-4 py-2.5 ${active ? "bg-[#22B8A8]" : "border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D]"}`}
                  style={{ flexShrink: 0, minWidth: 72 }}
                >
                  <Text
                    className={`text-center text-xs font-bold ${active ? "text-white" : "text-[#475569] dark:text-[#B7CBC4]"}`}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                    style={{ flexShrink: 0 }}
                  >
                    {periodLabels[key]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => setPeriod("custom")}
            className={`mt-2 self-start flex-row items-center rounded-2xl px-4 py-2.5 ${period === "custom" ? "bg-[#087F8C]" : "border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D]"}`}
          >
            <Text className={`mr-2 text-sm ${period === "custom" ? "text-white" : "text-[#087F8C] dark:text-[#72E6D4]"}`}>
              📅
            </Text>
            <Text
              className={`text-xs font-bold ${period === "custom" ? "text-white" : "text-[#475569] dark:text-[#B7CBC4]"}`}
            >
              Tùy chọn
            </Text>
          </Pressable>
        </View>

        {period === "custom" ? (
          <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-4">
            <Text className="text-sm font-bold text-[#164F4B] dark:text-[#E7F5F0]">Khoảng thời gian</Text>
            <View className="mt-3 flex-row gap-3">
              <Pressable
                onPress={() => openCalendar("start")}
                className="flex-1 rounded-2xl border border-[#E2E8F0] dark:border-[#31554B] bg-[#F8FAFC] dark:bg-[#10211F] p-3"
              >
                <Text className="text-[11px] font-semibold text-[#94A3B8] dark:text-[#A5BCB5]">Từ ngày</Text>
                <Text className="mt-1 text-sm font-bold text-[#334155] dark:text-[#DCEAE5]">
                  {formatCalendarDate(dateToIso(customRange?.start ?? null))}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => openCalendar("end")}
                className="flex-1 rounded-2xl border border-[#E2E8F0] dark:border-[#31554B] bg-[#F8FAFC] dark:bg-[#10211F] p-3"
              >
                <Text className="text-[11px] font-semibold text-[#94A3B8] dark:text-[#A5BCB5]">Đến ngày</Text>
                <Text className="mt-1 text-sm font-bold text-[#334155] dark:text-[#DCEAE5]">
                  {formatCalendarDate(dateToIso(customRange?.end ?? null))}
                </Text>
              </Pressable>
            </View>
            {!customRangeReady ? (
              <Text className="mt-3 text-xs text-[#64748B] dark:text-[#A5BCB5]">
                Chọn ngày bắt đầu và ngày kết thúc để xem báo cáo.
              </Text>
            ) : null}
          </View>
        ) : null}

        {loading && !data ? (
          <View className="mt-6 rounded-3xl bg-white dark:bg-[#17322D] p-6">
            <Text className="text-center text-sm text-[#64748B] dark:text-[#A5BCB5]">Đang tải báo cáo...</Text>
          </View>
        ) : period === "custom" && !customRangeReady ? (
          <View className="mt-4 rounded-3xl border border-dashed border-[#CBD5E1] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-6">
            <Text className="text-center text-sm font-semibold text-[#475569] dark:text-[#B7CBC4]">
              Chọn khoảng thời gian để bắt đầu xem báo cáo.
            </Text>
          </View>
        ) : (
          <>
            <View className="mt-4 rounded-3xl bg-[#0EA5A8] p-5">
              <Text className="text-xs font-bold tracking-wide text-white/80">
                DÒNG TIỀN RÒNG · {periodLabels[period].toUpperCase()}
              </Text>
              <Text className="mt-2 text-3xl font-bold text-white">
                {money(data?.summary.balance ?? 0)}
              </Text>
              <Text className="mt-1 text-xs text-white/80">
                Tỷ lệ tiết kiệm {(data?.summary.savingsRate ?? 0).toFixed(1)}%
              </Text>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-2xl bg-[#ECFDF5] dark:bg-[#1C4038] p-4">
                <Text className="text-xs font-semibold text-[#087F8C] dark:text-[#72E6D4]">Tổng thu</Text>
                <Text className="mt-1 text-base font-bold text-[#047857] dark:text-[#51D3A1]">
                  {money(data?.summary.income ?? 0)}
                </Text>
                <Text className="mt-1 text-[11px] font-semibold text-[#475569] dark:text-[#B7CBC4]">
                  {data?.summary.incomeCount ?? 0} giao dịch
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-[#FFF1F2] dark:bg-[#4A202A] p-4">
                <Text className="text-xs font-semibold text-[#087F8C] dark:text-[#72E6D4]">Tổng chi</Text>
                <Text className="mt-1 text-base font-bold text-[#BE123C]">
                  {money(data?.summary.expense ?? 0)}
                </Text>
                <Text className="mt-1 text-[11px] font-bold text-[#475569] dark:text-[#B7CBC4]">
                  {data?.summary.expenseCount ?? 0} giao dịch
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-5">
              <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">So với kỳ trước</Text>
              <View className="mt-4 flex-row gap-3">
                {[
                  ["Thu", data?.comparison.incomeChange ?? 0],
                  ["Chi", data?.comparison.expenseChange ?? 0],
                  ["Ròng", data?.comparison.balanceChange ?? 0],
                ].map(([label, value]) => (
                  <View key={String(label)} className="flex-1 rounded-2xl bg-[#F8FAFC] dark:bg-[#10211F] p-4">
                    <Text className="text-xs font-semibold text-[#087F8C] dark:text-[#72E6D4]">{label}</Text>
                    <Text
                      className={`mt-1 text-base font-bold ${String(label) === "Chi" ? (Number(value) <= 0 ? "text-[#047857] dark:text-[#51D3A1]" : "text-[#BE123C]") : Number(value) >= 0 ? "text-[#047857] dark:text-[#51D3A1]" : "text-[#BE123C]"}`}
                    >
                      {value == null ? "—" : percent(Number(value))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">Dòng tiền</Text>
                  <Text className="mt-1 text-xs font-semibold text-[#087F8C] dark:text-[#72E6D4]">
                    Thu và chi theo {cashFlowGranularity}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2.5 w-2.5 rounded-full bg-[#22B8A8]" />
                    <Text className="text-[10px] font-semibold text-[#64748B] dark:text-[#A5BCB5]">Thu</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2.5 w-2.5 rounded-full bg-[#FB7185]" />
                    <Text className="text-[10px] font-semibold text-[#64748B] dark:text-[#A5BCB5]">Chi</Text>
                  </View>
                </View>
              </View>
              {!hasCashFlowActivity ? (
                <Text className="mt-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#10211F] py-8 text-center text-sm text-[#64748B] dark:text-[#A5BCB5]">
                  Chưa có giao dịch trong kỳ này.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#10211F]"
                  contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 16, paddingBottom: 8, gap: 8 }}
                >
                  {(data?.cashFlow ?? []).map((item) => (
                    <View key={item.date} className="w-12 items-center">
                      <View className="h-32 flex-row items-end justify-center gap-0.5">
                        <View
                          className="w-2.5 rounded-t-full bg-[#22B8A8]"
                          style={{ height: Math.max(3, (item.income / maxFlow) * 112) }}
                        />
                        <View
                          className="w-2.5 rounded-t-full bg-[#FB7185]"
                          style={{ height: Math.max(3, (item.expense / maxFlow) * 112) }}
                        />
                      </View>
                      <Text className="mt-2 text-[9px] font-semibold text-[#475569] dark:text-[#B7CBC4]">
                        {cashFlowPointLabel(item.date, cashFlowGranularity)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View className="mt-2 flex-row justify-end">
                <Text className="text-[10px] font-semibold text-[#64748B] dark:text-[#A5BCB5]">
                  {(data?.cashFlow ?? []).length} {cashFlowGranularity} trong kỳ
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-5">
              <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">Chi tiêu theo danh mục</Text>
              {topCategories.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B] dark:text-[#A5BCB5]">Chưa có khoản chi trong kỳ này.</Text>
              ) : (
                topCategories.map((item) => (
                  <View key={item.categoryId ?? item.name} className="mt-4">
                    <View className="flex-row">
                      <Text className="flex-1 text-sm font-semibold text-[#334155] dark:text-[#DCEAE5]">{item.name}</Text>
                      <Text className="text-sm font-bold text-[#0F172A] dark:text-[#E7F5F0]">{money(item.amount)}</Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#31554B]">
                      <View
                        className="h-full rounded-full bg-[#22B8A8]"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-[11px] font-semibold text-[#475569] dark:text-[#B7CBC4]">
                      {item.percentage.toFixed(1)}% tổng chi
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-5">
              <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">Ngân sách</Text>
              {(data?.budgets ?? []).length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B] dark:text-[#A5BCB5]">Chưa có ngân sách trong kỳ này.</Text>
              ) : (
                data?.budgets.slice(0, 5).map((item) => (
                  <View key={item.budgetId} className="mt-4">
                    <View className="flex-row">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-[#334155] dark:text-[#DCEAE5]">{item.categoryName}</Text>
                        <Text className="mt-1 text-[11px] text-[#64748B] dark:text-[#A5BCB5]">
                          {item.walletName ?? "Tất cả ví"} · {walletTypeLabels[item.walletType ?? ""] ?? "Ví"}
                        </Text>
                      </View>
                      <Text className={`text-sm font-bold ${item.isOverBudget ? "text-[#BE123C]" : "text-[#0F172A] dark:text-[#E7F5F0]"}`}>
                        {money(item.spent)} / {money(item.limit)}
                      </Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#31554B]">
                      <View
                        className={`h-full rounded-full ${item.isOverBudget ? "bg-[#FB7185]" : "bg-[#22B8A8]"}`}
                        style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-[11px] font-bold text-[#475569] dark:text-[#B7CBC4]">
                      {item.isOverBudget ? "Đã vượt ngân sách" : `${item.percentageUsed.toFixed(0)}% đã sử dụng`}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-5">
              <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">💡 Gợi ý cho bạn</Text>
              {suggestions.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B] dark:text-[#A5BCB5]">
                  Chưa có điểm nổi bật cần lưu ý trong kỳ này.
                </Text>
              ) : (
                suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-5">
              <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">Theo ví</Text>
              <View className="mt-3 flex-row border-b border-[#E2E8F0] dark:border-[#31554B] pb-2">
                <Text className="flex-1 text-[11px] font-bold uppercase text-[#087F8C] dark:text-[#72E6D4]">Ví</Text>
                <Text className="w-24 text-right text-[11px] font-bold uppercase text-[#087F8C] dark:text-[#72E6D4]">Chi tiêu</Text>
                <Text className="w-28 text-right text-[11px] font-bold uppercase text-[#087F8C] dark:text-[#72E6D4]">Còn lại</Text>
              </View>
              {topWallets.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B] dark:text-[#A5BCB5]">Chưa có ví.</Text>
              ) : (
                topWallets.map((item) => (
                  <View key={item.walletId} className="mt-3 flex-row items-center">
                    <Text className="flex-1 pr-2 text-sm font-semibold text-[#334155] dark:text-[#DCEAE5]">{item.name}</Text>
                    <Text className="w-24 text-right text-sm font-bold text-[#BE123C]">{money(item.amount)}</Text>
                    <Text className={`w-28 text-right text-sm font-bold ${item.balance < 0 ? "text-[#BE123C]" : "text-[#047857] dark:text-[#51D3A1]"}`}>
                      {money(item.balance)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <CalendarDatePicker
        key={calendarMode ? `${calendarMode}-${dateToIso(draftDate)}` : "closed"}
        visible={calendarMode !== null}
        value={dateToIso(draftDate)}
        title={calendarMode === "start" ? "Chọn ngày bắt đầu" : "Chọn ngày kết thúc"}
        onSelect={selectCalendarDate}
        onClose={() => {
          setCalendarMode(null);
          setDraftDate(null);
        }}
      />
    </ScreenContainer>
  );
}
