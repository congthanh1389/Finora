import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { DeviceReportRepository, type ReportData } from "@/src/modules/report/repository/device-report.repository";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function ReportsScreen() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = await Auth.getUserInfo();
      if (!user) return setData(null);
      setData(await new DeviceReportRepository().getCurrentMonth(user.id));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const income = data?.income ?? 0;
  const expense = data?.expense ?? 0;
  const balance = income - expense;

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-[#0F2A5F]">Báo cáo</Text>
        <Text className="mt-1 text-sm text-[#64748B]">Tổng quan dòng tiền trong tháng hiện tại.</Text>

        <View className="mt-5 rounded-3xl bg-[#0EA5A8] p-5">
          <Text className="text-sm font-semibold text-white/90">DÒNG TIỀN THÁNG NÀY</Text>
          <Text className="mt-2 text-3xl font-bold text-white">{money(balance)}</Text>
          <Text className="mt-1 text-xs text-white/80">Thu nhập trừ chi tiêu</Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-[#ECFDF5] p-4"><Text className="text-xs text-[#64748B]">Tiền vào</Text><Text className="mt-1 text-base font-bold text-[#047857]">{money(income)}</Text></View>
          <View className="flex-1 rounded-2xl bg-[#FFF1F2] p-4"><Text className="text-xs text-[#64748B]">Tiền ra</Text><Text className="mt-1 text-base font-bold text-[#BE123C]">{money(expense)}</Text></View>
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Chi tiêu theo danh mục</Text>
          {loading ? <Text className="mt-4 text-sm text-[#64748B]">Đang tải...</Text> : (data?.categoryRows ?? []).length === 0 ? (
            <Text className="mt-4 text-sm text-[#64748B]">Chưa có khoản chi trong tháng này.</Text>
          ) : data?.categoryRows.map((row) => {
            const ratio = expense > 0 ? Math.min(100, Math.round(row.amount / expense * 100)) : 0;
            return <View key={row.categoryId ?? row.name} className="mt-4">
              <View className="flex-row"><Text className="flex-1 text-sm font-semibold text-[#334155]">{row.name}</Text><Text className="text-sm font-bold text-[#0F172A]">{money(row.amount)}</Text></View>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]"><View className="h-full rounded-full bg-[#22B8A8]" style={{ width: `${ratio}%` }} /></View>
              <Text className="mt-1 text-[11px] text-[#94A3B8]">{ratio}% tổng chi tiêu</Text>
            </View>;
          })}
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Tóm tắt</Text>
          <View className="mt-4 flex-row justify-between"><Text className="text-sm text-[#64748B]">Giao dịch thu</Text><Text className="font-semibold text-[#334155]">{data?.incomeCount ?? 0}</Text></View>
          <View className="mt-3 flex-row justify-between"><Text className="text-sm text-[#64748B]">Giao dịch chi</Text><Text className="font-semibold text-[#334155]">{data?.expenseCount ?? 0}</Text></View>
          <View className="mt-3 flex-row justify-between"><Text className="text-sm text-[#64748B]">Chuyển khoản tháng này</Text><Text className="font-semibold text-[#334155]">{money(data?.transfer ?? 0)}</Text></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
