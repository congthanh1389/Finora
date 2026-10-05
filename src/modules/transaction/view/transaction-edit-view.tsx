import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { FinoraMockupIcon, type FinoraMockupIconName } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { CategoryRepository } from "../../category/repository/category.repository";
import { DeviceWalletRepository } from "../../wallet/repository/device-wallet.repository";
import { TransactionEditService } from "../service/transaction-edit.service";

function formatAmount(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

export function TransactionEditView() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const transactionId = Number(params.id);
  const editService = useMemo(() => new TransactionEditService(), []);
  const walletRepository = useMemo(() => new DeviceWalletRepository(), []);
  const categoryRepository = useMemo(() => new CategoryRepository(), []);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [wallets, setWallets] = useState<Awaited<ReturnType<DeviceWalletRepository["listByUser"]>>>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<CategoryRepository["listByUser"]>>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!Number.isInteger(transactionId) || transactionId <= 0) throw new Error("Giao dịch không hợp lệ.");
        const user = await Auth.getUserInfo();
        if (!user) throw new Error("Không tìm thấy người dùng hiện tại.");
        const transaction = await editService.getTransaction(user.id, transactionId);
        if (!transaction) throw new Error("Không tìm thấy giao dịch.");
        if (transaction.type === "transfer") throw new Error("Chưa hỗ trợ sửa giao dịch chuyển tiền.");

        const [walletData, categoryData] = await Promise.all([
          walletRepository.listByUser(user.id),
          categoryRepository.listByUser(user.id, transaction.type),
        ]);
        const activeCategories = categoryData.filter((item) => item.type === transaction.type && item.isArchived === 0);
        if (active) {
          setType(transaction.type);
          setAmount(String(transaction.amount));
          setWalletId(transaction.walletId);
          setCategoryId(transaction.categoryId);
          setNote(transaction.note ?? "");
          setWallets(walletData);
          setCategories(activeCategories);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Không thể tải giao dịch.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [categoryRepository, editService, transactionId, walletRepository]);

  async function save() {
    const user = await Auth.getUserInfo();
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (!user) return setError("Không tìm thấy người dùng hiện tại.");
    if (!walletId) return setError("Vui lòng chọn ví.");
    if (!categoryId) return setError(type === "income" ? "Vui lòng chọn nguồn thu nhập." : "Vui lòng chọn danh mục chi tiêu.");

    try {
      setSaving(true);
      setError(null);
      await editService.updateTransaction({
        userId: user.id,
        transactionId,
        amount: parsedAmount,
        walletId,
        categoryId,
        note,
      });
      router.replace("/transaction");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thay đổi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ScreenContainer className="bg-[#F8FAFC]"><View className="flex-1 items-center justify-center"><ActivityIndicator /><Text className="mt-3 text-sm text-[#64748B]">Đang tải giao dịch...</Text></View></ScreenContainer>;
  }

  if (error && !wallets.length) {
    return <ScreenContainer className="bg-[#F8FAFC]"><View className="flex-1 px-5 pt-6"><Text className="text-xl font-bold text-[#0F2A5F]">Không thể sửa giao dịch</Text><Text className="mt-3 text-sm text-[#DC2626]">{error}</Text><Pressable onPress={() => router.back()} className="mt-6 items-center rounded-full bg-[#0F2A5F] py-4"><Text className="font-bold text-white">Quay lại</Text></Pressable></View></ScreenContainer>;
  }

  const isIncome = type === "income";

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-5 px-5 pt-4">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white"><Text className="text-2xl text-[#475569]">‹</Text></Pressable>
            <Text className="ml-3 flex-1 text-[24px] font-bold text-[#0F2A5F]">Sửa giao dịch</Text>
          </View>

          <View className={`items-center rounded-3xl p-6 ${isIncome ? "bg-[#ECFDF5]" : "bg-white"}`}>
            <Text className={`text-sm font-medium ${isIncome ? "text-[#047857]" : "text-[#64748B]"}`}>Số tiền {isIncome ? "nhận" : "chi"}</Text>
            <View className="mt-2 flex-row items-center">
              <TextInput value={formatAmount(amount)} onChangeText={setAmount} keyboardType="numeric" textAlign="right" className={`max-w-[280px] text-[38px] font-bold ${isIncome ? "text-[#047857]" : "text-[#0F2A5F]"}`} />
              <Text className={`ml-2 text-xl font-bold ${isIncome ? "text-[#059669]" : "text-[#64748B]"}`}>₫</Text>
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">{isIncome ? "Nguồn thu nhập" : "Danh mục chi tiêu"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
              {categories.map((item) => (
                <Pressable key={item.id} onPress={() => setCategoryId(item.id)} className={`w-[92px] items-center rounded-2xl border p-3 ${categoryId === item.id ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]"}`}>
                  <FinoraMockupIcon name={(item.icon || "01_finance_wallet") as FinoraMockupIconName} size={34} />
                  <Text className="mt-2 text-center text-xs font-semibold text-[#334155]">{item.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">Ví</Text>
            <View className="mt-3 gap-2">
              {wallets.map((wallet) => (
                <Pressable key={wallet.id} onPress={() => setWalletId(wallet.id)} className={`flex-row items-center rounded-2xl border p-3 ${walletId === wallet.id ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0]"}`}>
                  <FinoraMockupIcon name="01_finance_wallet" size={34} />
                  <View className="ml-3 flex-1"><Text className="font-bold text-[#0F2A5F]">{wallet.name}</Text><Text className="mt-0.5 text-xs text-[#64748B]">{wallet.currency}</Text></View>
                  <Text className="text-sm font-bold text-[#0F172A]">{new Intl.NumberFormat("vi-VN").format(wallet.balance)} ₫</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-base font-bold text-[#0F2A5F]">Ghi chú</Text>
            <TextInput value={note} onChangeText={setNote} multiline className="mt-3 min-h-[90px] rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-base text-[#0F172A]" />
          </View>

          {error ? <Text className="text-sm text-[#DC2626]">{error}</Text> : null}
          <Pressable disabled={saving} onPress={() => void save()} style={{ backgroundColor: isIncome ? "#059669" : "#22B8A8", opacity: saving ? 0.7 : 1 }} className="items-center rounded-full py-4">
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold text-white">Lưu thay đổi</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
