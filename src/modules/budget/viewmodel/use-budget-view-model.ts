import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import * as Auth from "@/lib/_core/auth";
import type { Category } from "@/drizzle/schema";
import { createCategoryDependencies } from "../../category/category.factory";
import { createWalletDependencies } from "../../wallet/wallet.factory";
import { createBudgetDependencies } from "../budget.factory";
import type { BudgetSummary } from "../types/budget.types";
import type { WalletSummary } from "../../wallet/types/wallet.types";

export function useBudgetViewModel() {
  const { budgetService } = useMemo(() => createBudgetDependencies(), []);
  const { categoryService } = useMemo(() => createCategoryDependencies(), []);
  const { walletService } = useMemo(() => createWalletDependencies(), []);

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
      setError("");
      const user = await Auth.getUserInfo();
      if (!user) { setBudgets([]); setCategories([]); setWallets([]); return; }
      const [nextBudgets, nextCategories, nextWallets] = await Promise.all([
        budgetService.listCurrentMonth(user.id),
        categoryService.listCategories(user.id, "expense"),
        walletService.listWallets(user.id),
      ]);
      setBudgets(nextBudgets);
      setCategories(nextCategories);
      setWallets(nextWallets.filter((item) => !item.isArchived));
      setSelectedCategoryId((current) => current && nextCategories.some((item) => item.id === current) ? current : nextCategories[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ngân sách.");
    } finally { setLoading(false); }
  }, [budgetService, categoryService, walletService]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function resetForm() { setEditingId(null); setAmountText(""); setError(""); setSelectedCategoryId(categories[0]?.id ?? null); setSelectedWalletId(null); }
  function startEdit(item: BudgetSummary) { setEditingId(item.id); setSelectedCategoryId(item.categoryId); setSelectedWalletId(item.walletId); setAmountText(String(item.amount)); setError(""); }

  async function saveBudget() {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      if (!selectedCategoryId) throw new Error("Hãy chọn danh mục chi tiêu.");
      const amount = Number(amountText.replace(/[^0-9]/g, ""));
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Số tiền ngân sách không hợp lệ.");
      if (editingId) {
        await budgetService.updateBudget(user.id, editingId, { categoryId: selectedCategoryId, walletId: selectedWalletId, amount });
      } else {
        const period = budgetService.getMonthPeriod();
        await budgetService.createBudget({ userId: user.id, categoryId: selectedCategoryId, walletId: selectedWalletId, amount, currency: "VND", periodStart: period.start, periodEnd: period.end });
      }
      resetForm(); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể lưu ngân sách."); }
  }

  async function deleteBudget(id: number) {
    try {
      const user = await Auth.getUserInfo();
      if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
      await budgetService.deleteBudget(user.id, id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể xóa ngân sách."); }
  }

  const totalAmount = budgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);

  return { budgets, categories, wallets, selectedCategoryId, selectedWalletId, amountText, editingId, error, loading, totalAmount, totalSpent, totalRemaining: totalAmount - totalSpent,
    setSelectedCategoryId: (id: number | null) => { setSelectedCategoryId(id); setError(""); },
    setSelectedWalletId,
    setAmountText: (value: string) => { setAmountText(value.replace(/[^0-9]/g, "")); setError(""); },
    resetForm, startEdit, saveBudget, deleteBudget, reload: load };
}