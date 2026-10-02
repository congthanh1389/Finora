import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

function formatMoney(value: string, currency = "VND") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Chào buổi sáng 👋";
  if (hour >= 12 && hour < 18) return "Chào buổi chiều 👋";
  return "Chào buổi tối 👋";
}

export default function HomeScreen() {
  const router = useRouter();
  const dashboard = trpc.dashboard.summary.useQuery(undefined, {
    staleTime: 30_000,
  });

  if (dashboard.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center bg-[#F8FAFC] px-5">
        <Text className="text-base font-semibold text-[#0F2A5F]">Đang tải tổng quan...</Text>
      </ScreenContainer>
    );
  }

  if (dashboard.isError) {
    return (
      <ScreenContainer className="items-center justify-center bg-[#F8FAFC] px-5">
        <View className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-6">
          <Text className="text-xl font-bold text-[#0F2A5F]">Chưa thể tải dữ liệu</Text>
          <Text className="mt-2 text-sm leading-5 text-[#64748B]">
            Hãy kiểm tra kết nối dữ liệu rồi thử lại.
          </Text>
          <TouchableOpacity
            onPress={() => dashboard.refetch()}
            className="mt-5 items-center rounded-full bg-[#22B8A8] px-5 py-4"
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const data = dashboard.data;
  const currency = data.accounts[0]?.currency ?? "VND";
  const maxExpense = Math.max(
    ...data.expenseByCategory.map((item) => Number(item.amount)),
    1,
  );

  return (
    <ScreenContainer className="bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-4 px-5 pt-4">
          <View>
            <Text className="text-[22px] font-bold text-[#0F2A5F]">Finora</Text>
            <Text className="mt-1 text-[21px] font-bold text-[#0F2A5F]">{getGreeting()}</Text>
            <Text className="mt-1 text-sm text-[#64748B]">
              Nhìn nhanh tình hình tài chính của bạn.
            </Text>
          </View>

          <View className="rounded-[28px] bg-[#0EA5A8] p-6 shadow-sm">
            <View className="flex-row items-center">
              <FinoraMockupIcon name="01_finance_wallet" size={24} />
              <Text className="ml-2 text-sm font-semibold text-white">TỔNG SỐ DƯ</Text>
            </View>
            <Text className="mt-3 text-[34px] font-bold text-white">
              {formatMoney(data.summary.totalBalance, currency)}
            </Text>
            <Text className="mt-2 text-sm text-white/90">
              {data.accounts.length} ví / tài khoản đang hoạt động
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/transaction")}
            className="flex-row items-center justify-center rounded-full bg-[#22B8A8] px-5 py-4"
          >
            <Text className="mr-3 text-3xl font-light text-white">+</Text>
            <Text className="text-base font-bold text-white">Thêm giao dịch</Text>
            <Text className="ml-auto text-2xl text-white">›</Text>
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-4">
              <Text className="text-xs text-[#64748B]">Tiền vào</Text>
              <Text className="mt-2 text-base font-bold text-[#047857]">
                {formatMoney(data.summary.income, currency)}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-4">
              <Text className="text-xs text-[#64748B]">Tiền ra</Text>
              <Text className="mt-2 text-base font-bold text-[#E11D48]">
                {formatMoney(data.summary.expense, currency)}
              </Text>
            </View>
          </View>

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <View className="flex-row items-center">
              <Text className="flex-1 text-lg font-bold text-[#0F2A5F]">Dòng tiền tháng này</Text>
              <Text className="text-sm font-semibold text-[#64748B]">
                {formatMoney(data.summary.netCashFlow, currency)}
              </Text>
            </View>
            <View className="mt-4 gap-4">
              <View>
                <View className="flex-row">
                  <Text className="flex-1 text-sm text-[#64748B]">Thu nhập</Text>
                  <Text className="text-sm font-bold text-[#047857]">
                    {formatMoney(data.summary.income, currency)}
                  </Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#D1FAE5]">
                  <View className="h-full w-full rounded-full bg-[#22C55E]" />
                </View>
              </View>
              <View>
                <View className="flex-row">
                  <Text className="flex-1 text-sm text-[#64748B]">Chi tiêu</Text>
                  <Text className="text-sm font-bold text-[#E11D48]">
                    {formatMoney(data.summary.expense, currency)}
                  </Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#FFE4E6]">
                  <View
                    className="h-full rounded-full bg-[#FB7185]"
                    style={{ width: `${Math.min((Number(data.summary.expense) / Math.max(Number(data.summary.income), 1)) * 100, 100)}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {data.expenseByCategory.length > 0 && (
            <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
              <Text className="text-lg font-bold text-[#0F2A5F]">Chi tiêu theo danh mục</Text>
              <View className="mt-4 gap-4">
                {data.expenseByCategory.slice(0, 5).map((item) => (
                  <View key={item.categoryId}>
                    <View className="flex-row">
                      <Text className="flex-1 text-sm text-[#334155]">{item.categoryName}</Text>
                      <Text className="text-sm font-bold text-[#E11D48]">
                        {formatMoney(item.amount, currency)}
                      </Text>
                    </View>
                    <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <View
                        className="h-full rounded-full bg-[#FB7185]"
                        style={{ width: `${(Number(item.amount) / maxExpense) * 100}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="rounded-3xl border border-[#E2E8F0] bg-white p-5">
            <View className="flex-row items-center">
              <Text className="flex-1 text-lg font-bold text-[#0F2A5F]">Giao dịch gần đây</Text>
              <TouchableOpacity onPress={() => router.push("/transactions")}>
                <Text className="text-xs font-semibold text-[#64748B]">Xem tất cả ›</Text>
              </TouchableOpacity>
            </View>

            {data.recentTransactions.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-sm text-[#64748B]">Chưa có giao dịch trong kỳ này.</Text>
                <Text className="mt-1 text-xs text-[#94A3B8]">Hãy bắt đầu bằng một giao dịch đầu tiên.</Text>
              </View>
            ) : (
              <View className="mt-3">
                {data.recentTransactions.map((item) => (
                  <View key={item.id} className="flex-row items-center border-b border-[#EEF2F7] py-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]">
                      <Text className="text-base font-bold text-[#64748B]">
                        {item.type === "income" ? "↑" : item.type === "expense" ? "↓" : "↔"}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-[#0F2A5F]">
                        {item.categoryName ?? (item.type === "transfer" ? "Chuyển tiền" : item.note ?? "Giao dịch")}
                      </Text>
                      <Text className="mt-0.5 text-xs text-[#94A3B8]">
                        {item.accountName} · {formatDate(item.transactionDate)}
                      </Text>
                    </View>
                    <Text className={`text-sm font-bold ${item.type === "income" ? "text-[#059669]" : item.type === "expense" ? "text-[#E11D48]" : "text-[#64748B]"}`}>
                      {item.type === "income" ? "+" : item.type === "expense" ? "-" : ""}{formatMoney(item.amount, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
