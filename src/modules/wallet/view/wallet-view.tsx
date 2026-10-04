import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";
import type { WalletType } from "../types/wallet.types";
import { useWalletViewModel } from "../viewmodel/use-wallet-view-model";

const walletTypes: { value: WalletType; label: string; icon: string }[] = [
  { value: "cash", label: "Tiền mặt", icon: "01_finance_wallet" },
  { value: "bank", label: "Ngân hàng", icon: "01_finance_wallet" },
  { value: "ewallet", label: "Ví điện tử", icon: "01_finance_wallet" },
  { value: "credit_card", label: "Thẻ tín dụng", icon: "01_finance_wallet" },
  { value: "savings", label: "Tiết kiệm", icon: "01_finance_wallet" },
];

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function WalletView() {
  const router = useRouter();
  const vm = useWalletViewModel();

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="gap-4 px-5 pt-4">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-[28px] font-bold text-[#0F2A5F]">Ví của tôi</Text>
              <Text className="mt-1 text-sm text-[#64748B]">Quản lý tài sản của bạn thật gọn gàng.</Text>
            </View>
            <Pressable
              accessibilityLabel="Thêm ví"
              onPress={() => vm.setCreateOpen(true)}
              className="h-11 w-11 items-center justify-center rounded-full bg-[#22B8A8]"
            >
              <Text className="text-2xl font-light text-white">+</Text>
            </Pressable>
          </View>

          <View className="rounded-[28px] bg-[#0F2A5F] p-6">
            <Text className="text-xs font-semibold tracking-wider text-white/70">TỔNG SỐ DƯ</Text>
            <Text className="mt-2 text-[32px] font-bold text-white">{formatVnd(vm.totalBalance)}</Text>
            <Text className="mt-1 text-xs text-white/70">{vm.wallets.length} ví đang được quản lý</Text>
          </View>

          {vm.isLoading ? (
            <View className="items-center rounded-3xl border border-[#E2E8F0] bg-white py-12">
              <ActivityIndicator />
              <Text className="mt-3 text-sm text-[#64748B]">Đang tải danh sách ví...</Text>
            </View>
          ) : vm.error ? (
            <View className="rounded-3xl border border-[#FECACA] bg-white p-5">
              <Text className="text-base font-bold text-[#991B1B]">Không thể tải dữ liệu cục bộ</Text>
              <Text className="mt-1 text-sm text-[#64748B]">Vui lòng thử lại.</Text>
            </View>
          ) : vm.wallets.length === 0 ? (
            <View className="items-center rounded-3xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12">
              <FinoraMockupIcon name="01_finance_wallet" size={52} />
              <Text className="mt-4 text-lg font-bold text-[#0F2A5F]">Chưa có ví nào</Text>
              <Text className="mt-1 text-center text-sm text-[#64748B]">Thêm ví đầu tiên để Finora bắt đầu theo dõi tài sản.</Text>
              <Pressable onPress={() => vm.setCreateOpen(true)} className="mt-5 rounded-full bg-[#22B8A8] px-6 py-3">
                <Text className="font-bold text-white">Thêm ví đầu tiên</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-3">
              {vm.wallets.map((wallet) => (
                <View key={wallet.id} className="flex-row items-center rounded-3xl border border-[#E2E8F0] bg-white p-4">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                    <FinoraMockupIcon name="01_finance_wallet" size={32} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-bold text-[#0F2A5F]">{wallet.name}</Text>
                    <Text className="mt-1 text-xs text-[#64748B]">{wallet.type} · {wallet.currency}</Text>
                  </View>
                  <Text className="text-base font-bold text-[#0F172A]">{formatVnd(wallet.balance)}</Text>
                </View>
              ))}
            </View>
          )}

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#0F2A5F]">Giao dịch gần đây</Text>
                <Text className="mt-1 text-xs text-[#64748B]">Dữ liệu được lưu trực tiếp trên thiết bị.</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable onPress={() => router.push("/transaction/transfer")} className="rounded-full bg-[#EFF6FF] px-4 py-2">
                  <Text className="text-xs font-bold text-[#0F2A5F]">Chuyển tiền</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/transaction/new")} className="rounded-full bg-[#E6FFFA] px-4 py-2">
                  <Text className="text-xs font-bold text-[#047857]">+ Giao dịch</Text>
                </Pressable>
              </View>
            </View>

            {vm.isLoadingTransactions ? (
              <ActivityIndicator className="mt-5" />
            ) : vm.transactions.length === 0 ? (
              <View className="mt-4 rounded-2xl bg-[#F8FAFC] p-4">
                <Text className="text-sm text-[#64748B]">Chưa có giao dịch nào.</Text>
                <Text className="mt-1 text-xs text-[#94A3B8]">Thêm một giao dịch để lịch sử xuất hiện tại đây.</Text>
              </View>
            ) : (
              <View className="mt-4 gap-2">
                {vm.transactions.slice(0, 20).map((transaction) => {
                  const isIncome = transaction.type === "income";
                  const wallet = vm.wallets.find((item) => item.id === transaction.walletId);
                  return (
                    <View key={transaction.id} className="flex-row items-center rounded-2xl border border-[#E2E8F0] p-3">
                      <View className={"h-10 w-10 items-center justify-center rounded-xl " + (isIncome ? "bg-[#ECFDF5]" : "bg-[#FFF1F2]")}>
                        <Text className={"text-lg font-bold " + (isIncome ? "text-[#059669]" : "text-[#E11D48]")}>
                          {isIncome ? "+" : "−"}
                        </Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-[#0F2A5F]">{transaction.note || (isIncome ? "Khoản thu" : "Khoản chi")}</Text>
                        <Text className="mt-1 text-xs text-[#64748B]">
                          {wallet?.name || "Ví"} · {formatDate(transaction.occurredAt)}
                        </Text>
                      </View>
                      <Text className={"text-sm font-bold " + (isIncome ? "text-[#059669]" : "text-[#E11D48]")}>
                        {isIncome ? "+" : "−"}{formatVnd(transaction.amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={vm.isCreateOpen} transparent animationType="slide" onRequestClose={vm.resetForm}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-[30px] bg-white px-5 pb-8 pt-5">
            <View className="flex-row items-center">
              <Text className="flex-1 text-xl font-bold text-[#0F2A5F]">Thêm ví</Text>
              <Pressable onPress={vm.resetForm} className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9]">
                <Text className="text-lg text-[#475569]">×</Text>
              </Pressable>
            </View>

            <Text className="mt-5 text-sm font-semibold text-[#334155]">Tên ví</Text>
            <TextInput
              value={vm.name}
              onChangeText={vm.setName}
              placeholder="Ví tiền mặt"
              placeholderTextColor="#94A3B8"
              className="mt-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-base text-[#0F172A]"
            />

            <Text className="mt-4 text-sm font-semibold text-[#334155]">Loại ví</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              <View className="flex-row gap-2">
                {walletTypes.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => vm.setType(item.value)}
                    className={"rounded-2xl border px-4 py-3 " + (vm.type === item.value ? "border-[#22B8A8] bg-[#E6FFFA]" : "border-[#E2E8F0] bg-white")}
                  >
                    <Text className={vm.type === item.value ? "font-bold text-[#047857]" : "font-semibold text-[#475569]"}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="mt-4 text-sm font-semibold text-[#334155]">Số dư ban đầu</Text>
            <TextInput
              value={vm.openingBalance}
              onChangeText={vm.setOpeningBalance}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              className="mt-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-base text-[#0F172A]"
            />

            {vm.createError ? <Text className="mt-3 text-sm text-[#DC2626]">Không thể tạo ví. Vui lòng thử lại.</Text> : null}

            <Pressable
              disabled={vm.isCreating || !vm.name.trim()}
              onPress={() => void vm.submit()}
              className={"mt-5 items-center rounded-full px-5 py-4 " + (vm.isCreating || !vm.name.trim() ? "bg-[#CBD5E1]" : "bg-[#22B8A8]")}
            >
              {vm.isCreating ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold text-white">Lưu ví</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
