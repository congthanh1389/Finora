import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { FinoraIcon } from "@/components/ui/finora-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const quickActions = [
  { icon: "01_finance_wallet", label: "Ví của tôi", color: "bg-blue-50" },
  { icon: "02_management_budget", label: "Ngân sách", color: "bg-orange-50" },
  { icon: "04_reports_report", label: "Báo cáo", color: "bg-purple-50" },
] as const;

const recentTransactions = [
  { icon: "08_actions_add", title: "Ăn uống", subtitle: "Cơm trưa · Ăn uống", time: "Hôm nay 12:30", amount: "-120.000 ₫", type: "expense" },
  { icon: "01_finance_wallet", title: "WinMart", subtitle: "Mua sắm", time: "Hôm nay 10:15", amount: "-350.000 ₫", type: "expense" },
  { icon: "01_finance_income", title: "Lương", subtitle: "Thu nhập", time: "30/09 08:00", amount: "+25.000.000 ₫", type: "income" },
] as const;

export default function HomeScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-5 px-5 pt-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary">
              <FinoraIcon name="00_brand_finora_mark" size={28} color={colors.background} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-medium text-muted">Finora</Text>
              <Text className="mt-0.5 text-2xl font-bold text-foreground">Chào buổi sáng 👋</Text>
              <Text className="mt-1 text-sm text-muted">Hôm nay bạn muốn làm gì?</Text>
            </View>
            <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-surface" activeOpacity={0.7}>
              <FinoraIcon name="05_calendar_notifications_notification" size={23} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <View className="overflow-hidden rounded-[28px] bg-primary">
            <View className="p-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-background/80">TỔNG TÀI SẢN</Text>
                <FinoraIcon name="01_finance_wallet" size={22} color={colors.background} />
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[32px] font-bold tracking-tight text-background">24.580.000 ₫</Text>
                <FinoraIcon name="06_settings_help" size={22} color={colors.background} />
              </View>
              <View className="mt-2 flex-row items-center">
                <View className="rounded-full bg-background/20 px-2.5 py-1">
                  <Text className="text-xs font-bold text-background">↑ 8,4%</Text>
                </View>
                <Text className="ml-2 text-xs text-background/75">so với tháng trước</Text>
              </View>
            </View>
            <View className="flex-row bg-background px-5 py-4">
              <View className="flex-1">
                <Text className="text-xs text-muted">Tiền vào</Text>
                <Text className="mt-1 text-base font-bold text-green-600">+32.500.000 ₫</Text>
              </View>
              <View className="w-px bg-border" />
              <View className="flex-1 pl-5">
                <Text className="text-xs text-muted">Tiền ra</Text>
                <Text className="mt-1 text-base font-bold text-red-500">-7.920.000 ₫</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85} className="flex-row items-center justify-center rounded-2xl bg-primary px-5 py-4">
            <FinoraIcon name="08_actions_add" size={23} color={colors.background} />
            <Text className="ml-2 text-base font-bold text-background">Thêm giao dịch</Text>
            <Text className="ml-auto text-2xl font-light text-background">›</Text>
          </TouchableOpacity>

          <View className="flex-row gap-3">
            {quickActions.map((action) => (
              <TouchableOpacity key={action.label} activeOpacity={0.8} className={`flex-1 items-center rounded-2xl border border-border p-4 ${action.color}`}>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-background">
                  <FinoraIcon name={action.icon} size={25} color={colors.tint} />
                </View>
                <Text className="mt-3 text-center text-sm font-semibold text-foreground">{action.label}</Text>
                <Text className="mt-1 text-base text-muted">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="rounded-3xl border border-border bg-surface p-5">
            <View className="flex-row items-center">
              <FinoraIcon name="05_calendar_notifications_calendar" size={21} color={colors.tint} />
              <Text className="ml-2 flex-1 text-lg font-bold text-foreground">THÁNG 10</Text>
              <Text className="text-xs font-medium text-muted">Xem chi tiết ›</Text>
            </View>
            <View className="mt-5 gap-4">
              <View>
                <View className="flex-row items-center">
                  <Text className="flex-1 text-sm text-foreground">Thu nhập</Text>
                  <Text className="text-sm font-bold text-green-600">32.500.000 ₫</Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-green-100"><View className="h-full w-[82%] rounded-full bg-green-500" /></View>
              </View>
              <View>
                <View className="flex-row items-center">
                  <Text className="flex-1 text-sm text-foreground">Chi tiêu</Text>
                  <Text className="text-sm font-bold text-red-500">7.920.000 ₫</Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-red-100"><View className="h-full w-[25%] rounded-full bg-red-400" /></View>
              </View>
              <View>
                <View className="flex-row items-center">
                  <Text className="flex-1 text-sm text-foreground">Tiết kiệm</Text>
                  <Text className="text-sm font-bold text-indigo-500">24.580.000 ₫</Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-100"><View className="h-full w-[76%] rounded-full bg-indigo-500" /></View>
              </View>
            </View>
            <View className="mt-5 items-center">
              <View className="h-24 w-24 items-center justify-center rounded-full border-[10px] border-primary/20">
                <View className="absolute h-24 w-24 rounded-full border-[10px] border-primary" />
                <Text className="text-xl font-bold text-foreground">76%</Text>
                <Text className="text-[10px] text-muted">Tiết kiệm</Text>
              </View>
            </View>
          </View>

          <View className="rounded-3xl border border-border bg-surface p-5">
            <View className="flex-row items-center">
              <FinoraIcon name="07_navigation_transactions" size={22} color={colors.tint} />
              <Text className="ml-2 flex-1 text-lg font-bold text-foreground">Giao dịch gần đây</Text>
              <Text className="text-xs font-medium text-muted">Xem tất cả ›</Text>
            </View>
            <View className="mt-3">
              {recentTransactions.map((transaction, index) => (
                <View key={`${transaction.title}-${index}`} className={`flex-row items-center py-3 ${index !== recentTransactions.length - 1 ? "border-b border-border" : ""}`}>
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <FinoraIcon name={transaction.icon} size={21} color={colors.tint} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-foreground">{transaction.title}</Text>
                    <Text className="mt-0.5 text-xs text-muted">{transaction.subtitle}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-sm font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-500"}`}>{transaction.amount}</Text>
                    <Text className="mt-0.5 text-[10px] text-muted">{transaction.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="overflow-hidden rounded-3xl bg-primary/10 p-5">
            <View className="flex-row">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15"><Text className="text-lg">✨</Text></View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-primary">Finora Insight</Text>
                <Text className="mt-2 text-sm leading-5 text-foreground">Bạn đã chi ít hơn 12% cho ăn uống so với tháng trước. Thật tuyệt vời!</Text>
                <Text className="mt-3 text-xs font-bold text-primary">Xem phân tích →</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
