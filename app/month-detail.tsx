import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useReportViewModel } from "@/src/modules/report/viewmodel/use-report-view-model";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " ₫";

function parseLocalDate(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function dateParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default function MonthDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ start?: string | string[]; end?: string | string[] }>();
  const startParam = Array.isArray(params.start) ? params.start[0] : params.start;
  const endParam = Array.isArray(params.end) ? params.end[0] : params.end;

  const range = useMemo(() => {
    const start = parseLocalDate(startParam);
    const end = parseLocalDate(endParam);
    if (start && end && end >= start) return { start, end };
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }, [startParam, endParam]);

  const { data, loading } = useReportViewModel(undefined, range);
  const monthTitle = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(range.start);
  const categories = data?.categories ?? [];

  return (
    <ScreenContainer className="bg-[#EAF9F4] dark:bg-[#10211F]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-4 px-5 pt-4">
          <View className="flex-row items-center">
            <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()} className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#17322D]">
              <Text className="text-2xl font-semibold text-[#087F8C]">‹</Text>
            </Pressable>
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-wide text-[#087F8C] dark:text-[#72E6D4]">Tổng kết tài chính</Text>
              <Text className="mt-1 text-2xl font-bold capitalize text-[#164F4B] dark:text-[#E7F5F0]">Chi tiết {monthTitle}</Text>
              <Text className="mt-1 text-xs text-[#64748B] dark:text-[#A5BCB5]">{formatDate(range.start)} – {formatDate(range.end)}</Text>
            </View>
          </View>

          {loading && !data ? (
            <View className="rounded-3xl bg-white p-6 dark:bg-[#17322D]">
              <Text className="text-center text-sm text-[#64748B] dark:text-[#A5BCB5]">Đang tải số liệu tháng...</Text>
            </View>
          ) : (
            <>
              <View className="rounded-3xl bg-[#0EA5A8] p-5 shadow-sm">
                <Text className="text-xs font-bold uppercase tracking-wide text-white/80">Thu – chi ròng trong tháng</Text>
                <Text className="mt-2 text-3xl font-bold text-white">{money(data?.summary.balance ?? 0)}</Text>
                <Text className="mt-2 text-sm text-white/90">Tỷ lệ tiết kiệm {((data?.summary.savingsRate ?? 0)).toFixed(1)}%</Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 rounded-3xl border border-[#D5F3E8] bg-white p-4 dark:border-[#31554B] dark:bg-[#17322D]">
                  <Text className="text-xs font-semibold text-[#087F8C] dark:text-[#72E6D4]">Tổng thu</Text>
                  <Text className="mt-2 text-base font-bold text-[#047857] dark:text-[#51D3A1]">{money(data?.summary.income ?? 0)}</Text>
                  <Text className="mt-1 text-xs text-[#64748B] dark:text-[#A5BCB5]">{data?.summary.incomeCount ?? 0} giao dịch</Text>
                </View>
                <View className="flex-1 rounded-3xl border border-[#FFE0E5] bg-white p-4 dark:border-[#4A202A] dark:bg-[#17322D]">
                  <Text className="text-xs font-semibold text-[#087F8C] dark:text-[#72E6D4]">Tổng chi</Text>
                  <Text className="mt-2 text-base font-bold text-[#E11D48]">{money(data?.summary.expense ?? 0)}</Text>
                  <Text className="mt-1 text-xs text-[#64748B] dark:text-[#A5BCB5]">{data?.summary.expenseCount ?? 0} giao dịch</Text>
                </View>
              </View>

              <View className="rounded-3xl border border-[#D5F3E8] bg-white p-5 dark:border-[#31554B] dark:bg-[#17322D]">
                <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">Chi tiêu theo danh mục</Text>
                {categories.length === 0 ? (
                  <Text className="mt-3 text-sm text-[#64748B] dark:text-[#A5BCB5]">Chưa có khoản chi trong khoảng thời gian này.</Text>
                ) : categories.map((item) => (
                  <View key={item.categoryId ?? item.name} className="mt-4">
                    <View className="flex-row items-center">
                      <Text className="flex-1 pr-3 text-sm font-semibold text-[#334155] dark:text-[#DCEAE5]">{item.name}</Text>
                      <Text className="text-sm font-bold text-[#164F4B] dark:text-[#E7F5F0]">{money(item.amount)}</Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#DDF5EC] dark:bg-[#1C4038]">
                      <View className="h-full rounded-full bg-[#22B8A8]" style={{ width: `${Math.max(0, Math.min(item.percentage, 100))}%` }} />
                    </View>
                    <Text className="mt-1 text-xs text-[#64748B] dark:text-[#A5BCB5]">{item.percentage.toFixed(1)}% tổng chi</Text>
                  </View>
                ))}
              </View>

              <View className="rounded-3xl border border-[#D5F3E8] bg-white p-5 dark:border-[#31554B] dark:bg-[#17322D]">
                <Text className="text-lg font-bold text-[#164F4B] dark:text-[#E7F5F0]">So với kỳ trước</Text>
                <View className="mt-3 flex-row gap-3">
                  <View className="flex-1 rounded-2xl bg-[#F0FBF7] p-3 dark:bg-[#10211F]">
                    <Text className="text-xs text-[#64748B] dark:text-[#A5BCB5]">Thu nhập</Text>
                    <Text className="mt-1 text-sm font-bold text-[#047857] dark:text-[#51D3A1]">{data?.comparison.incomeChange == null ? "—" : `${data.comparison.incomeChange >= 0 ? "+" : ""}${data.comparison.incomeChange.toFixed(1)}%`}</Text>
                  </View>
                  <View className="flex-1 rounded-2xl bg-[#FFF4F5] p-3 dark:bg-[#10211F]">
                    <Text className="text-xs text-[#64748B] dark:text-[#A5BCB5]">Chi tiêu</Text>
                    <Text className="mt-1 text-sm font-bold text-[#BE123C]">{data?.comparison.expenseChange == null ? "—" : `${data.comparison.expenseChange >= 0 ? "+" : ""}${data.comparison.expenseChange.toFixed(1)}%`}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/reports", params: { start: dateParam(range.start), end: dateParam(range.end) } })}
            className="flex-row items-center justify-center rounded-full bg-[#22B8A8] px-5 py-4"
          >
            <Text className="text-base font-bold text-white">Phân tích báo cáo đầy đủ</Text>
            <Text className="ml-2 text-xl text-white">›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
