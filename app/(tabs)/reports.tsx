import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import type { ReportPeriod } from "@/src/modules/report/model/report.types";
import { ReportCalendar } from "@/src/modules/report/components/report-calendar";
import { useReportViewModel } from "@/src/modules/report/viewmodel/use-report-view-model";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " ₫";
const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const formatDate = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    : "Chọn ngày";

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

export default function ReportsScreen() {
  const {
    data,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    loading,
  } = useReportViewModel();
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

  const openCalendar = (mode: "start" | "end") => {
    setDraftDate(mode === "start" ? customRange?.start ?? new Date() : customRange?.end ?? customRange?.start ?? new Date());
    setCalendarMode(mode);
  };

  const confirmCalendar = (date: Date) => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (calendarMode === "start") {
      const end = customRange?.end && normalized > customRange.end ? null : customRange?.end ?? null;
      setCustomRange({ start: normalized, end: end ?? normalized });
    } else if (calendarMode === "end") {
      const start = customRange?.start ?? normalized;
      if (normalized < start) {
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
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-[#0F2A5F]">Báo cáo</Text>
        <Text className="mt-1 text-sm text-[#64748B]">
          Nhìn nhanh tình hình tài chính của bạn.
        </Text>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {(Object.keys(periodLabels) as ReportPeriod[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              className={`rounded-full px-4 py-2.5 ${period === key ? "bg-[#22B8A8]" : "border border-[#7C3AED] bg-white"}`}
            >
              <Text
                className={`text-center text-xs font-bold ${period === key ? "text-white" : "text-[#7C3AED]"}`}
              >
                {periodLabels[key]}
              </Text>
            </Pressable>
          ))}
        </View>

        {period === "custom" ? (
          <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-4">
            <Text className="text-sm font-bold text-[#0F2A5F]">Khoảng thời gian</Text>
            <View className="mt-3 flex-row gap-3">
              <Pressable
                onPress={() => openCalendar("start")}
                className="flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3"
              >
                <Text className="text-[11px] font-semibold text-[#94A3B8]">Từ ngày</Text>
                <Text className="mt-1 text-sm font-bold text-[#334155]">
                  {formatDate(customRange?.start ?? null)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => openCalendar("end")}
                className="flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3"
              >
                <Text className="text-[11px] font-semibold text-[#94A3B8]">Đến ngày</Text>
                <Text className="mt-1 text-sm font-bold text-[#334155]">
                  {formatDate(customRange?.end ?? null)}
                </Text>
              </Pressable>
            </View>
            {!customRangeReady ? (
              <Text className="mt-3 text-xs text-[#64748B]">
                Chọn ngày bắt đầu và ngày kết thúc để xem báo cáo.
              </Text>
            ) : null}
          </View>
        ) : null}

        {loading && !data ? (
          <View className="mt-6 rounded-3xl bg-white p-6">
            <Text className="text-center text-sm text-[#64748B]">Đang tải báo cáo...</Text>
          </View>
        ) : period === "custom" && !customRangeReady ? (
          <View className="mt-4 rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-6">
            <Text className="text-center text-sm font-semibold text-[#475569]">
              Chọn khoảng thời gian để bắt đầu xem báo cáo.
            </Text>
          </View>
        ) : (
          <>
            <View className="mt-4 rounded-3xl bg-[#0EA5A8] p-5">
              <Text className="text-xs font-bold tracking-wide text-white/80">
                SỐ DƯ RÒNG · {periodLabels[period].toUpperCase()}
              </Text>
              <Text className="mt-2 text-3xl font-bold text-white">
                {money(data?.summary.balance ?? 0)}
              </Text>
              <Text className="mt-1 text-xs text-white/80">
                Tỷ lệ tiết kiệm {(data?.summary.savingsRate ?? 0).toFixed(1)}%
              </Text>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-2xl bg-[#ECFDF5] p-4">
                <Text className="text-xs font-semibold text-[#7C3AED]">Tổng thu</Text>
                <Text className="mt-1 text-base font-bold text-[#047857]">
                  {money(data?.summary.income ?? 0)}
                </Text>
                <Text className="mt-1 text-[11px] font-semibold text-[#475569]">
                  {data?.summary.incomeCount ?? 0} giao dịch
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-[#FFF1F2] p-4">
                <Text className="text-xs font-semibold text-[#7C3AED]">Tổng chi</Text>
                <Text className="mt-1 text-base font-bold text-[#BE123C]">
                  {money(data?.summary.expense ?? 0)}
                </Text>
                <Text className="mt-1 text-[11px] text-[#64748B]">
                  {data?.summary.expenseCount ?? 0} giao dịch
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">So với kỳ trước</Text>
              <View className="mt-4 flex-row gap-3">
                {[
                  ["Thu", data?.comparison.incomeChange ?? 0],
                  ["Chi", data?.comparison.expenseChange ?? 0],
                  ["Ròng", data?.comparison.balanceChange ?? 0],
                ].map(([label, value]) => (
                  <View key={String(label)} className="flex-1 rounded-2xl bg-[#F8FAFC] p-4">
                    <Text className="text-xs font-semibold text-[#7C3AED]">{label}</Text>
                    <Text
                      className={`mt-1 text-base font-bold ${String(label) === "Chi" ? (Number(value) <= 0 ? "text-[#047857]" : "text-[#BE123C]") : Number(value) >= 0 ? "text-[#047857]" : "text-[#BE123C]"}`}
                    >
                      {percent(Number(value))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-[#0F2A5F]">Dòng tiền</Text>
                  <Text className="mt-1 text-xs font-semibold text-[#7C3AED]">Thu và chi theo ngày</Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2.5 w-2.5 rounded-full bg-[#22B8A8]" />
                    <Text className="text-[10px] font-semibold text-[#64748B]">Thu</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-2.5 w-2.5 rounded-full bg-[#FB7185]" />
                    <Text className="text-[10px] font-semibold text-[#64748B]">Chi</Text>
                  </View>
                </View>
              </View>
              {(data?.cashFlow ?? []).length === 0 ? (
                <Text className="mt-4 rounded-2xl bg-[#F8FAFC] py-8 text-center text-sm text-[#64748B]">
                  Chưa có giao dịch trong kỳ này.
                </Text>
              ) : (
                <View className="mt-5 rounded-2xl bg-[#F8FAFC] px-2 pt-4">
                  <View className="h-32 flex-row items-end gap-1.5">
                    {(data?.cashFlow ?? []).slice(-5).map((item) => (
                      <View key={item.date} className="flex-1 flex-row items-end justify-center gap-0.5">
                        <View
                          className="w-2.5 rounded-t-full bg-[#22B8A8]"
                          style={{ height: Math.max(3, (item.income / maxFlow) * 112) }}
                        />
                        <View
                          className="w-2.5 rounded-t-full bg-[#FB7185]"
                          style={{ height: Math.max(3, (item.expense / maxFlow) * 112) }}
                        />
                      </View>
                    ))}
                  </View>
                  <View className="mt-2 flex-row border-t border-[#E2E8F0] pt-2">
                    {(data?.cashFlow ?? []).slice(-5).map((item) => (
                      <Text key={item.date} className="flex-1 text-center text-[9px] font-semibold text-[#475569]">
                        {item.date.slice(8)}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
              <View className="mt-2 flex-row justify-end">
                <Text className="text-[10px] font-semibold text-[#64748B]">
                  {(data?.cashFlow ?? []).slice(-5).length} ngày gần nhất
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">Chi tiêu theo danh mục</Text>
              {topCategories.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B]">Chưa có khoản chi trong kỳ này.</Text>
              ) : (
                topCategories.map((item) => (
                  <View key={item.categoryId ?? item.name} className="mt-4">
                    <View className="flex-row">
                      <Text className="flex-1 text-sm font-semibold text-[#334155]">{item.name}</Text>
                      <Text className="text-sm font-bold text-[#0F172A]">{money(item.amount)}</Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <View
                        className="h-full rounded-full bg-[#22B8A8]"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-[11px] font-semibold text-[#475569]">
                      {item.percentage.toFixed(1)}% tổng chi
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">Ngân sách</Text>
              {(data?.budgets ?? []).length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B]">Chưa có ngân sách trong kỳ này.</Text>
              ) : (
                data?.budgets.slice(0, 5).map((item) => (
                  <View key={item.budgetId} className="mt-4">
                    <View className="flex-row">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-[#334155]">{item.categoryName}</Text>
                        <Text className="mt-1 text-[11px] text-[#64748B]">
                          {item.walletName ?? "Tất cả ví"} · {walletTypeLabels[item.walletType ?? ""] ?? "Ví"}
                        </Text>
                      </View>
                      <Text className={`text-sm font-bold ${item.isOverBudget ? "text-[#BE123C]" : "text-[#0F172A]"}`}>
                        {money(item.spent)} / {money(item.limit)}
                      </Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <View
                        className={`h-full rounded-full ${item.isOverBudget ? "bg-[#FB7185]" : "bg-[#1769D2]"}`}
                        style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-[11px] text-[#94A3B8]">
                      {item.isOverBudget ? "Đã vượt ngân sách" : `${item.percentageUsed.toFixed(0)}% đã sử dụng`}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">Gợi ý</Text>
              {(data?.insights ?? []).map((item) => (
                <View key={item.title} className="mt-3 rounded-2xl bg-[#F8FAFC] p-4">
                  <Text className="text-sm font-bold text-[#334155]">{item.title}</Text>
                  <Text className="mt-1 text-xs leading-5 text-[#64748B]">{item.description}</Text>
                </View>
              ))}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">Theo ví</Text>
              <View className="mt-3 flex-row border-b border-[#E2E8F0] pb-2">
                <Text className="flex-1 text-[11px] font-bold uppercase text-[#7C3AED]">Ví</Text>
                <Text className="w-24 text-right text-[11px] font-bold uppercase text-[#7C3AED]">Chi tiêu</Text>
                <Text className="w-28 text-right text-[11px] font-bold uppercase text-[#7C3AED]">Còn lại</Text>
              </View>
              {topWallets.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B]">Chưa có ví.</Text>
              ) : (
                topWallets.map((item) => (
                  <View key={item.walletId} className="mt-3 flex-row items-center">
                    <Text className="flex-1 pr-2 text-sm font-semibold text-[#334155]">{item.name}</Text>
                    <Text className="w-24 text-right text-sm font-bold text-[#BE123C]">{money(item.amount)}</Text>
                    <Text className={`w-28 text-right text-sm font-bold ${item.balance < 0 ? "text-[#BE123C]" : "text-[#047857]"}`}>
                      {money(item.balance)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      <ReportCalendar
        key={calendarMode ? `${calendarMode}-${draftDate?.getTime() ?? "none"}` : "closed"}
        visible={calendarMode !== null}
        value={draftDate}
        title={calendarMode === "start" ? "Chọn ngày bắt đầu" : "Chọn ngày kết thúc"}
        onCancel={() => {
          setCalendarMode(null);
          setDraftDate(null);
        }}
        onConfirm={confirmCalendar}
      />
    </ScreenContainer>
  );
}
