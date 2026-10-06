import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { DeviceTransactionRepository } from "@/src/modules/transaction/repository/device-transaction.repository";
import { CategoryRepository } from "@/src/modules/category/repository/category.repository";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function ReportsScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = await Auth.getUserInfo();
      if (!user) {
        setTransactions([]);
        setCategories([]);
        return;
      }
      const [items, categoryItems] = await Promise.all([
        new DeviceTransactionRepository().list(user.id),
        new CategoryRepository().listByUser(user.id),
      ]);
      setTransactions(items);
      setCategories(categoryItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const summary = useMemo(() => {
    const now = new Date();
    const month = transactions.filter((item) => {
      const date = new Date(item.occurredAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
    const income = month.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = month.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    const transfer = month.filter((item) => item.type === "transfer").reduce((sum, item) => sum + item.amount, 0);
    const byCategory = new Map<number, number>();
    for (const item of month) {
      if (item.type !== "expense" || item.categoryId == null) continue;
      byCategory.set(item.categoryId, (byCategory.get(item.categoryId) ?? 0) + item.amount);
    }
    const categoryRows = [...byCategory.entries()]
      .map(([id, amount]) => ({ name: categories.find((item) => item.id === id)?.name ?? "Khác", amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    return { income, expense, transfer, balance: income - expense, categoryRows };
  }, [transactions, categories]);

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-[#0F2A5F]">Báo cáo</Text>
        <Text className="mt-1 text-sm text-[#64748B]">Tổng quan dòng tiền trong tháng hiện tại.</Text>

        <View className="mt-5 rounded-3xl bg-[#0EA5A8] p-5">
          <Text className="text-sm font-semibold text-white/90">DÒNG TIỀN THÁNG NÀY</Text>
          <Text className="mt-2 text-3xl font-bold text-white">{money(summary.balance)}</Text>
          <Text className="mt-1 text-xs text-white/80">Thu nhập trừ chi tiêu</Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-[#ECFDF5] p-4"><Text className="text-xs text-[#64748B]">Tiền vào</Text><Text className="mt-1 text-base font-bold text-[#047857]">{money(summary.income)}</Text></View>
          <View className="flex-1 rounded-2xl bg-[#FFF1F2] p-4"><Text className="text-xs text-[#64748B]">Tiền ra</Text><Text className="mt-1 text-base font-bold text-[#BE123C]">{money(summary.expense)}</Text></View>
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Chi tiêu theo danh mục</Text>
          {loading ? <Text className="mt-4 text-sm text-[#64748B]">Đang tải...</Text> : summary.categoryRows.length === 0 ? (
            <Text className="mt-4 text-sm text-[#64748B]">Chưa có khoản chi trong tháng này.</Text>
          ) : summary.categoryRows.map((row) => {
            const ratio = summary.expense > 0 ? Math.min(100, Math.round(row.amount / summary.expense * 100)) : 0;
            return <View key={row.name} className="mt-4">
              <View className="flex-row"><Text className="flex-1 text-sm font-semibold text-[#334155]">{row.name}</Text><Text className="text-sm font-bold text-[#0F172A]">{money(row.amount)}</Text></View>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]"><View className="h-full rounded-full bg-[#22B8A8]" style={{ width: `${ratio}%` }} /></View>
              <Text className="mt-1 text-[11px] text-[#94A3B8]">{ratio}% tổng chi tiêu</Text>
            </View>;
          })}
        </View>

        <View className="mt-4 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-lg font-bold text-[#0F2A5F]">Tóm tắt</Text>
          <View className="mt-4 flex-row justify-between"><Text className="text-sm text-[#64748B]">Giao dịch thu</Text><Text className="font-semibold text-[#334155]">{transactions.filter((x) => x.type === "income").length}</Text></View>
          <View className="mt-3 flex-row justify-between"><Text className="text-sm text-[#64748B]">Giao dịch chi</Text><Text className="font-semibold text-[#334155]">{transactions.filter((x) => x.type === "expense").length}</Text></View>
          <View className="mt-3 flex-row justify-between"><Text className="text-sm text-[#64748B]">Chuyển khoản tháng này</Text><Text className="font-semibold text-[#334155]">{money(summary.transfer)}</Text></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
