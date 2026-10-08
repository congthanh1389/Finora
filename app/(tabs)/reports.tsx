import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useReportViewModel } from "@/src/modules/report/viewmodel/use-report-view-model";
import type { ReportPeriod } from "@/src/modules/report/model/report.types";

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(value)) + " ₫";

const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const periodLabels: Record<ReportPeriod, string> = {
  week: "7 ngày",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

export default function ReportsScreen() {
  const { data, period, setPeriod, loading } = useReportViewModel();

  const maxFlow = useMemo(
    () =>
      Math.max(
        ...(data?.cashFlow ?? []).flatMap((item) => [item.income, item.expense]),
        1,
      ),
    [data],
  );

  const topCategories = data?.categories.slice(0, 5) ?? [];
  const topWallets = data?.wallets.slice(0, 5) ?? [];

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

        <View className="mt-4 flex-row gap-2">
          {(Object.keys(periodLabels) as ReportPeriod[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              className={`flex-1 rounded-full px-2 py-2.5 ${
                period === key
                  ? "bg-[#22B8A8]"
                  : "border border-[#E2E8F0] bg-white"
              }`}
            >
              <Text
                className={`text-center text-xs font-bold ${
                  period === key ? "text-white" : "text-[#64748B]"
                }`}
              >
                {periodLabels[key]}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading && !data ? (
          <View className="mt-6 rounded-3xl bg-white p-6">
            <Text className="text-center text-sm text-[#64748B]">
              Đang tải báo cáo...
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
                Tỷ lệ tiết kiệm {((data?.summary.savingsRate ?? 0)).toFixed(1)}%
              </Text>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-2xl bg-[#ECFDF5] p-4">
                <Text className="text-xs text-[#64748B]">Tổng thu</Text>
                <Text className="mt-1 text-base font-bold text-[#047857]">
                  {money(data?.summary.income ?? 0)}
                </Text>
                <Text className="mt-1 text-[11px] text-[#64748B]">
                  {data?.summary.incomeCount ?? 0} giao dịch
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-[#FFF1F2] p-4">
                <Text className="text-xs text-[#64748B]">Tổng chi</Text>
                <Text className="mt-1 text-base font-bold text-[#BE123C]">
                  {money(data?.summary.expense ?? 0)}
                </Text>
                <Text className="mt-1 text-[11px] text-[#64748B]">
                  {data?.summary.expenseCount ?? 0} giao dịch
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">
                So với kỳ trước
              </Text>
              <View className="mt-4 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-[#F8FAFC] p-4">
                  <Text className="text-xs text-[#64748B]">Thu</Text>
                  <Text className={`mt-1 text-base font-bold ${
                    (data?.comparison.incomeChange ?? 0) >= 0
                      ? "text-[#047857]"
                      : "text-[#BE123C]"
                  }`}>
                    {percent(data?.comparison.incomeChange ?? 0)}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-[#F8FAFC] p-4">
                  <Text className="text-xs text-[#64748B]">Chi</Text>
                  <Text className={`mt-1 text-base font-bold ${
                    (data?.comparison.expenseChange ?? 0) <= 0
                      ? "text-[#047857]"
                      : "text-[#BE123C]"
                  }`}>
                    {percent(data?.comparison.expenseChange ?? 0)}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-[#F8FAFC] p-4">
                  <Text className="text-xs text-[#64748B]">Ròng</Text>
                  <Text className={`mt-1 text-base font-bold ${
                    (data?.comparison.balanceChange ?? 0) >= 0
                      ? "text-[#047857]"
                      : "text-[#BE123C]"
                  }`}>
                    {percent(data?.comparison.balanceChange ?? 0)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">
                Dòng tiền
              </Text>
              {(data?.cashFlow ?? []).length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B]">
                  Chưa có giao dịch trong kỳ này.
                </Text>
              ) : (
                <View className="mt-5 flex-row items-end justify-between gap-1">
                  {(data?.cashFlow ?? []).slice(-14).map((item) => (
                    <View key={item.date} className="flex-1 items-center">
                      <View className="h-28 w-full justify-end">
                        <View
                          className="w-full rounded-t-md bg-[#22B8A8]"
                          style={{
                            height: Math.max(2, (item.income / maxFlow) * 112),
                          }}
                        />
                        {item.expense > 0 ? (
                          <View
                            className="mt-1 w-full rounded-t-md bg-[#FB7185]"
                            style={{
                              height: Math.max(2, (item.expense / maxFlow) * 112),
                            }}
                          />
                        ) : null}
                      </View>
                      <Text className="mt-1 text-[8px] text-[#94A3B8]">
                        {item.date.slice(8)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <View className="mt-3 flex-row gap-4">
                <Text className="text-[11px] text-[#64748B]">● Thu</Text>
                <Text className="text-[11px] text-[#64748B]">● Chi</Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">
                Chi tiêu theo danh mục
              </Text>
              {topCategories.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B]">
                  Chưa có khoản chi trong kỳ này.
                </Text>
              ) : (
                topCategories.map((item) => (
                  <View key={item.categoryId ?? item.name} className="mt-4">
                    <View className="flex-row">
                      <Text className="flex-1 text-sm font-semibold text-[#334155]">
                        {item.name}
                      </Text>
                      <Text className="text-sm font-bold text-[#0F172A]">
                        {money(item.amount)}
                      </Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <View
                        className="h-full rounded-full bg-[#22B8A8]"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </View>
                    <Text className="mt-1 text-[11px] text-[#94A3B8]">
                      {item.percentage.toFixed(1)}% tổng chi
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">
                Chi tiêu theo ví
              </Text>
              {topWallets.length === 0 ? (
                <Text className="mt-4 text-sm text-[#64748B]">
                  Chưa có khoản chi theo ví trong kỳ này.
                </Text>
              ) : (
                topWallets.map((item) => (
                  <View key={item.walletId} className="mt-4">
                    <View className="flex-row">
                      <Text className="flex-1 text-sm font-semibold text-[#334155]">
                        {item.name}
                      </Text>
                      <Text className="text-sm font-bold text-[#0F172A]">
                        {money(item.amount)}
                      </Text>
                    </View>
                    <Text className="mt-1 text-[11px] text-[#94A3B8]">
                      {item.percentage.toFixed(1)}% tổng chi
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">Tóm tắt</Text>
              <View className="mt-4 flex-row justify-between">
                <Text className="text-sm text-[#64748B]">Chuyển tiền</Text>
                <Text className="font-semibold text-[#334155]">
                  {money(data?.summary.transfer ?? 0)}
                </Text>
              </View>
              <View className="mt-3 flex-row justify-between">
                <Text className="text-sm text-[#64748B]">Số dư ròng</Text>
                <Text className="font-bold text-[#22B8A8]">
                  {money(data?.summary.balance ?? 0)}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
