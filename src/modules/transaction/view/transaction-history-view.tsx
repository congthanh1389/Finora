import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { DeviceTransactionRepository } from "../repository/device-transaction.repository";
import { DeviceWalletRepository } from "../../wallet/repository/device-wallet.repository";
import { CategoryRepository } from "../../category/repository/category.repository";
import type { WalletType } from "../../wallet/types/wallet.types";
import type { Transaction, Wallet } from "../../../../drizzle/schema";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

const walletTypeLabels: Record<WalletType, string> = {
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function TransactionHistoryView() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<CategoryRepository["listByUser"]>>>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const transactionRepository = useMemo(() => new DeviceTransactionRepository(), []);
  const walletRepository = useMemo(() => new DeviceWalletRepository(), []);
  const categoryRepository = useMemo(() => new CategoryRepository(), []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const user = await Auth.getUserInfo();
        if (!user) {
          if (active) {
            setTransactions([]);
            setWallets([]);
            setCategories([]);
          }
          return;
        }

        const [transactionData, walletData, categoryData] = await Promise.all([
          transactionRepository.list(user.id),
          walletRepository.listByUser(user.id),
          categoryRepository.listByUser(user.id),
        ]);

        if (active) {
          setTransactions(transactionData);
          setWallets(walletData);
          setCategories(categoryData);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error("Failed to load transactions"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [transactionRepository, walletRepository, categoryRepository]);

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-4 px-5 pt-4">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Text className="text-2xl text-[#475569]">‹</Text>
            </Pressable>
            <View className="ml-3 flex-1">
              <Text className="text-[24px] font-bold text-[#0F2A5F]">Tất cả giao dịch</Text>
              <Text className="mt-1 text-xs text-[#64748B]">Các giao dịch đã lưu trên thiết bị</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable onPress={() => router.push("/transaction/transfer")} className="rounded-full bg-[#0F2A5F] px-4 py-2">
                <Text className="text-xs font-bold text-white">Chuyển tiền</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/transaction/new")} className="rounded-full bg-[#22B8A8] px-4 py-2">
                <Text className="text-xs font-bold text-white">+ Giao dịch</Text>
              </Pressable>
            </View>
          </View>

          {isLoading ? (
            <View className="items-center rounded-3xl border border-[#E2E8F0] bg-white py-12">
              <ActivityIndicator />
              <Text className="mt-3 text-sm text-[#64748B]">Đang tải giao dịch...</Text>
            </View>
          ) : error ? (
            <View className="rounded-3xl border border-[#FECACA] bg-white p-5">
              <Text className="text-base font-bold text-[#991B1B]">Không thể tải giao dịch</Text>
              <Text className="mt-1 text-sm text-[#64748B]">Vui lòng thử lại.</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="items-center rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12">
              <FinoraMockupIcon name="07_navigation_transactions" size={52} />
              <Text className="mt-4 text-lg font-bold text-[#0F2A5F]">Chưa có giao dịch</Text>
              <Text className="mt-1 text-center text-sm text-[#64748B]">Hãy tạo khoản thu hoặc khoản chi đầu tiên.</Text>
              <Pressable onPress={() => router.push("/transaction/new")} className="mt-5 rounded-full bg-[#22B8A8] px-6 py-3">
                <Text className="font-bold text-white">Thêm giao dịch</Text>
              </Pressable>
            </View>
          ) : (
            <View className="rounded-3xl border border-[#E2E8F0] bg-white p-4">
              {transactions.map((transaction, index) => {
                const isTransfer = transaction.type === "transfer";
                const isIncome = transaction.type === "income";
                const wallet = wallets.find((item) => item.id === transaction.walletId);
                const sourceWallet = wallets.find((item) => item.id === transaction.sourceWalletId);
                const destinationWallet = wallets.find((item) => item.id === transaction.destinationWalletId);
                const category = categories.find((item) => item.id === transaction.categoryId);
                return (
                  <View key={transaction.id} className={"flex-row items-center py-4 " + (index !== transactions.length - 1 ? "border-b border-[#EEF2F7]" : "")}>
                    <View className={"h-11 w-11 items-center justify-center rounded-xl " + (isTransfer ? "bg-[#EFF6FF]" : isIncome ? "bg-[#ECFDF5]" : "bg-[#FFF1F2]")}>
                      <FinoraMockupIcon name="01_finance_wallet" size={28} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-[#0F2A5F]">
                        {isTransfer ? (transaction.note || "Chuyển tiền") : (category?.name || (isIncome ? "Khoản thu" : "Khoản chi"))}
                      </Text>
                      <Text className="mt-1 text-xs text-[#64748B]">
                        {isTransfer
                          ? (sourceWallet?.name || "Ví nguồn") + " → " + (destinationWallet?.name || "Ví nhận")
                          : (wallet?.name || "Ví") + " · " + (wallet ? walletTypeLabels[wallet.type] : "Không rõ loại ví")}
                      </Text>
                      <Text className="mt-1 text-[11px] text-[#94A3B8]">{formatDate(transaction.occurredAt)}</Text>
                    </View>
                    <View className="items-end gap-2">
                      <Text className={"text-sm font-bold " + (isTransfer ? "text-[#0F2A5F]" : isIncome ? "text-[#059669]" : "text-[#E11D48]")}>
                        {isTransfer ? "" : isIncome ? "+" : "−"}{formatVnd(transaction.amount)}
                      </Text>
                      {!isTransfer ? (
                        <Pressable onPress={() => router.push(`/transaction/edit?id=${transaction.id}`)} className="rounded-full bg-[#E6FFFA] px-3 py-1.5">
                          <Text className="text-xs font-bold text-[#0F766E]">Sửa</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
