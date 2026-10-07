import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useReportViewModel } from "@/src/modules/report/viewmodel/use-report-view-model";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function ReportsScreen() {
  const { data, period, setPeriod, loading } = useReportViewModel();

  const income = data?.income ?? 0;
  const expense = data?.expense ?? 0;
  const net = income - expense;
  const maxCategory = useMemo(() => Math.max(...(data?.categoryRows ?? []).map((row) => row.amount), 1), [data]);
  const maxWallet = useMemo(() => Math.max(...(data?.walletRows ?? []).map((row) => row.amount), 1), [data]);

  const periodLabel = period === "current" ? "Tháng này" : period === "previous" ? "Tháng trước" : "Năm nay";

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-[#0F2A5F]">Báo cáo</Text>
        <Text className="mt-1 text-sm text-[#64748B]">Phân tích thu, chi và dòng tiền theo thời gian.</Text>

        <View className="mt-4 flex-row gap-2">
          {(["current", "previous", "year"] as PeriodKey[]).map((key) => (
            <TouchableOpacity key={key} onPress={() => setPeriod(key)} className={`flex-1 rounded-full px-3 py-2.5 ${period === key ? "bg-[#22B8A8]" : "bg-white border border-[#E2E8F0]"}`}>
              <Text className={`text-center text-xs font-bold ${period === key ? "text-white" : "text-[#64748B]"}`}>
                {key === "current" ? "Tháng này" : key === "previous" ? "Tháng trước" : "Năm nay"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-4 rounded-3xl bg-[#0EA5A8] p-5">
          <Text className="text-sm font-semibold text-white/90">DÒNG TIỀN · {periodLabel.toUpperCase()}</Text>
          <Text className="mt-2 text-3xl font-bold text-white">{money(net)}</Text>
          <Text className="mt-1 text-xs text-white/80">Thu nhập trừ chi tiêu</Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-[#ECFDF5] p-4">
            <Text className="text-xs text-[#64748B]">Tiền vào</Text>
            <Text className="mt-1 text-base font-bold text-[#047857]">{money(income)}</Text>
            <Text className="mt-1 text-[11px] text-[#64748B]">{data?.incomeCount ?? 0} giao dịch</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-[#FFF1F2] p-4">
            <Text className="text-xs text-[#64748B]">Tiền ra</Text>
            <Text className="mt-1 text-base font-bold text-[#BE123C]">{money(expense)}</Text>
            <Text className="mt-1 text-[11px] text-[#64748B]">{data?.expenseCount ?? 0} giao dịch</Text>
          </View>
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">So với kỳ trước</Text>
          <View className="mt-4 flex-row gap-3">
            {[["Thu", income, data?.previous.income ?? 0], ["Chi", expense, data?.previous.expense ?? 0]].map(([label, current, previous]) => {
              const delta = Number(current) - Number(previous);
              return (
                <View key={String(label)} className="flex-1 rounded-2xl bg-[#F8FAFC] p-4">
                  <Text className="text-xs text-[#64748B]">{label}</Text>
                  <Text className={`mt-1 text-sm font-bold ${delta >= 0 ? "text-[#047857]" : "text-[#BE123C]"}`}>
                    {delta >= 0 ? "+" : ""}{money(delta)}
                  </Text>
                  <Text className="mt-1 text-[11px] text-[#94A3B8]">so với kỳ trước</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Chi tiêu theo danh mục</Text>
          {loading ? <Text className="mt-4 text-sm text-[#64748B]">Đang tải...</Text> : (data?.categoryRows ?? []).length === 0 ? (
            <Text className="mt-4 text-sm text-[#64748B]">Chưa có khoản chi trong kỳ này.</Text>
          ) : data?.categoryRows.map((row) => {
            const ratio = Math.round(row.amount / expense * 100);
            const width = Math.round(row.amount / maxCategory * 100);
            return <View key={row.categoryId ?? row.name} className="mt-4">
              <View className="flex-row"><Text className="flex-1 text-sm font-semibold text-[#334155]">{row.name}</Text><Text className="text-sm font-bold text-[#0F172A]">{money(row.amount)}</Text></View>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]"><View className="h-full rounded-full bg-[#22B8A8]" style={{ width: `${width}%` }} /></View>
              <Text className="mt-1 text-[11px] text-[#94A3B8]">{ratio}% tổng chi tiêu</Text>
            </View>;
          })}
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Chi tiêu theo ví</Text>
          {(data?.walletRows ?? []).length === 0 ? (
            <Text className="mt-4 text-sm text-[#64748B]">Chưa có khoản chi theo ví trong kỳ này.</Text>
          ) : data?.walletRows.map((row) => (
            <View key={row.walletId} className="mt-4">
              <View className="flex-row"><Text className="flex-1 text-sm font-semibold text-[#334155]">{row.name}</Text><Text className="text-sm font-bold text-[#0F172A]">{money(row.amount)}</Text></View>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]"><View className="h-full rounded-full bg-[#1769D2]" style={{ width: `${Math.round(row.amount / maxWallet * 100)}%` }} /></View>
            </View>
          ))}
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Tóm tắt</Text>
          <View className="mt-4 flex-row justify-between"><Text className="text-sm text-[#64748B]">Chuyển tiền</Text><Text className="font-semibold text-[#334155]">{money(data?.transfer ?? 0)}</Text></View>
          <View className="mt-3 flex-row justify-between"><Text className="text-sm text-[#64748B]">Dòng tiền ròng</Text><Text className="font-bold text-[#22B8A8]">{money(net)}</Text></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
