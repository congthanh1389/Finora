import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import { ScreenContainer } from "@/components/screen-container";
import { createCategoryDependencies } from "@/src/modules/category/category.factory";
import { BudgetService } from "@/src/modules/budget/service/budget.service";
import { DeviceBudgetRepository } from "@/src/modules/budget/repository/device-budget.repository";
import { DeviceWalletRepository } from "@/src/modules/wallet/repository/device-wallet.repository";
import { WalletService } from "@/src/modules/wallet/service/wallet.service";
import type { Category } from "@/drizzle/schema";
import type { BudgetSummary } from "@/src/modules/budget/types/budget.types";
import type { WalletSummary } from "@/src/modules/wallet/types/wallet.types";

const money = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";

export default function BudgetScreen() {
  const router = useRouter();
  const budgetService = useMemo(() => new BudgetService(new DeviceBudgetRepository()), []);
  const { categoryService } = useMemo(() => createCategoryDependencies(), []);
  const walletService = useMemo(() => new WalletService(new DeviceWalletRepository()), []);
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [amountText, setAmountText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const user = await Auth.getUserInfo();
      if (!user) return;
      const [nextBudgets, nextCategories, nextWallets] = await Promise.all([
        budgetService.listCurrentMonth(user.id),
        categoryService.listCategories(user.id, "expense"),
        walletService.listWallets(user.id),
      ]);
      setBudgets(nextBudgets);
      setCategories(nextCategories);
      setWallets(nextWallets.filter((item) => !item.isArchived));
      if (!selectedCategoryId && nextCategories[0]) setSelectedCategoryId(nextCategories[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ngân sách.");
    } finally {
      setLoading(false);
    }
  }, [budgetService, categoryService, walletService, selectedCategoryId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function resetForm() {
    setEditingId(null);
    setAmountText("");
    setError("");
    if (categories[0]) setSelectedCategoryId(categories[0].id);
    setSelectedWalletId(null);
  }

  function startEdit(item: BudgetSummary) {
    setEditingId(item.id);
    setSelectedCategoryId(item.categoryId);
    setSelectedWalletId(item.walletId);
    setAmountText(String(item.amount));
    setError("");
  }

  async function saveBudget() {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      if (!selectedCategoryId) throw new Error("Hãy chọn danh mục chi tiêu.");
      const amount = Number(amountText.replace(/[^0-9]/g, ""));
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Số tiền ngân sách không hợp lệ.");
      const period = budgetService.getMonthPeriod();
      if (editingId) {
        await budgetService.updateBudget(user.id, editingId, { categoryId: selectedCategoryId, walletId: selectedWalletId, amount });
      } else {
        await budgetService.createBudget({
          userId: user.id,
          categoryId: selectedCategoryId,
          walletId: selectedWalletId,
          amount,
          currency: "VND",
          periodStart: period.start,
          periodEnd: period.end,
        });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu ngân sách.");
    }
  }

  function confirmDelete(item: BudgetSummary) {
    Alert.alert("Xóa ngân sách", `Bạn có chắc muốn xóa ngân sách “${item.categoryName ?? "Không tên"}”?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => void deleteBudget(item.id) },
    ]);
  }

  async function deleteBudget(id: number) {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      await budgetService.deleteBudget(user.id, id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa ngân sách.");
    }
  }

  const monthLabel = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date());
  const totalAmount = budgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalAmount - totalSpent;

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white"><Text className="text-2xl text-[#475569]">‹</Text></Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-[#0F2A5F]">Ngân sách</Text>
            <Text className="mt-1 text-xs text-[#64748B]">Theo dõi chi tiêu theo từng mục trong tháng.</Text>
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-[#0EA5A8] p-5">
          <Text className="text-sm font-semibold text-white/90">{monthLabel}</Text>
          <View className="mt-4 flex-row">
            <View className="flex-1"><Text className="text-xs text-white/80">Ngân sách</Text><Text className="mt-1 text-lg font-bold text-white">{money(totalAmount)}</Text></View>
            <View className="flex-1"><Text className="text-xs text-white/80">Đã chi</Text><Text className="mt-1 text-lg font-bold text-white">{money(totalSpent)}</Text></View>
            <View className="flex-1"><Text className="text-xs text-white/80">Còn lại</Text><Text className="mt-1 text-lg font-bold text-white">{money(totalRemaining)}</Text></View>
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base font-bold text-[#0F2A5F]">{editingId ? "Sửa ngân sách" : "Thêm ngân sách"}</Text>
          <Text className="mt-4 text-sm font-bold text-[#334155]">Danh mục chi tiêu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {categories.map((item) => (
              <Pressable key={item.id} onPress={() => { setSelectedCategoryId(item.id); setError(""); }} className="mr-2 rounded-2xl px-4 py-3" style={{ backgroundColor: selectedCategoryId === item.id ? "#22B8A8" : "#F1F5F9" }}>
                <Text className={selectedCategoryId === item.id ? "font-bold text-white" : "font-semibold text-[#475569]"}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="mt-4 text-sm font-bold text-[#334155]">Phạm vi ví</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <Pressable onPress={() => setSelectedWalletId(null)} className="mr-2 rounded-2xl px-4 py-3" style={{ backgroundColor: selectedWalletId === null ? "#DBEAFE" : "#F1F5F9" }}>
              <Text className={selectedWalletId === null ? "font-bold text-[#2563EB]" : "font-semibold text-[#475569]"}>Tất cả ví</Text>
            </Pressable>
            {wallets.map((item) => (
              <Pressable key={item.id} onPress={() => setSelectedWalletId(item.id)} className="mr-2 rounded-2xl px-4 py-3" style={{ backgroundColor: selectedWalletId === item.id ? "#DBEAFE" : "#F1F5F9" }}>
                <Text className={selectedWalletId === item.id ? "font-bold text-[#2563EB]" : "font-semibold text-[#475569]"}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="mt-4 text-sm font-bold text-[#334155]">Hạn mức tháng</Text>
          <TextInput value={amountText} onChangeText={(value) => { setAmountText(value.replace(/[^0-9]/g, "")); setError(""); }} keyboardType="numeric" placeholder="Ví dụ: 5.000.000" placeholderTextColor="#94A3B8" className="mt-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A]" />
          {error ? <Text className="mt-2 text-sm text-[#DC2626]">{error}</Text> : null}
          <View className="mt-3 flex-row gap-2">
            {editingId ? <Pressable onPress={resetForm} className="flex-1 rounded-2xl bg-[#E2E8F0] py-3"><Text className="text-center font-bold text-[#475569]">Hủy</Text></Pressable> : null}
            <Pressable onPress={() => void saveBudget()} className="flex-1 rounded-2xl bg-[#22B8A8] py-3"><Text className="text-center font-bold text-white">{editingId ? "Lưu thay đổi" : "+ Thêm ngân sách"}</Text></Pressable>
          </View>
        </View>

        <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
          <Text className="text-base font-bold text-[#0F2A5F]">Ngân sách tháng này</Text>
          {loading ? <Text className="mt-4 text-sm text-[#64748B]">Đang tải...</Text> : budgets.length === 0 ? <Text className="mt-4 text-sm text-[#64748B]">Chưa có ngân sách. Hãy tạo ngân sách đầu tiên.</Text> : budgets.map((item) => {
            const over = item.spent > item.amount;
            return (
              <View key={item.id} className="mt-3 rounded-2xl bg-[#F8FAFC] p-4">
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="font-bold text-[#334155]">{item.categoryName ?? "Danh mục"}</Text>
                    <Text className="mt-1 text-xs text-[#64748B]">{item.walletName ? `Ví: ${item.walletName}` : "Tất cả ví"}</Text>
                  </View>
                  <Text className={over ? "font-bold text-[#DC2626]" : "font-bold text-[#0F766E]"}>{Math.round(item.progress * 100)}%</Text>
                </View>
                <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#E2E8F0]"><View className={over ? "h-full rounded-full bg-[#EF4444]" : "h-full rounded-full bg-[#22B8A8]"} style={{ width: `${Math.min(100, item.progress * 100)}%` }} /></View>
                <View className="mt-2 flex-row">
                  <Text className="flex-1 text-xs text-[#64748B]">Đã chi {money(item.spent)}</Text>
                  <Text className="text-xs font-semibold text-[#475569]">Hạn mức {money(item.amount)}</Text>
                </View>
                <Text className={over ? "mt-1 text-xs font-semibold text-[#DC2626]" : "mt-1 text-xs font-semibold text-[#64748B]"}>{over ? `Vượt ${money(item.spent - item.amount)}` : `Còn ${money(item.remaining)}`}</Text>
                <View className="mt-3 flex-row justify-end gap-2">
                  <Pressable onPress={() => startEdit(item)} className="rounded-xl bg-[#DBEAFE] px-3 py-2"><Text className="text-sm font-bold text-[#2563EB]">Sửa</Text></Pressable>
                  <Pressable onPress={() => confirmDelete(item)} className="rounded-xl bg-[#FEE2E2] px-3 py-2"><Text className="text-sm font-bold text-[#DC2626]">Xóa</Text></Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
