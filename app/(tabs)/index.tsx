import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { FinoraIcon } from "@/components/ui/finora-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const quickActions = [
  { icon: "08_actions_add", label: "Thêm giao dịch", hint: "Thu • Chi • Chuyển" },
  { icon: "01_finance_wallet", label: "Ví của tôi", hint: "Tài khoản & số dư" },
  { icon: "02_management_budget", label: "Ngân sách", hint: "Theo dõi hạn mức" },
  { icon: "04_reports_report", label: "Báo cáo", hint: "Phân tích chi tiêu" },
] as const;

const summary = [
  { icon: "01_finance_income", label: "Thu nhập", value: "—" },
  { icon: "01_finance_expense", label: "Chi tiêu", value: "—" },
] as const;

export default function HomeScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="px-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}
      >
        <View className="gap-6">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary">
              <FinoraIcon name="00_brand_finora_mark" size={28} color={colors.background} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-medium text-muted">Finora</Text>
              <Text className="text-2xl font-bold text-foreground">Tổng quan</Text>
            </View>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-surface"
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
            >
              <FinoraIcon
                name="05_calendar_notifications_notification"
                size={22}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>

          <View className="rounded-[28px] bg-primary p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-background/75">Tổng tài sản</Text>
              <FinoraIcon name="01_finance_wallet" size={21} color={colors.background} />
            </View>
            <Text className="mt-3 text-[38px] font-bold tracking-tight text-background">—</Text>
            <Text className="mt-1 text-sm text-background/65">
              Số dư sẽ cập nhật khi có ví và giao dịch
            </Text>
          </View>

          <View className="flex-row gap-3">
            {summary.map((item) => (
              <View
                key={item.label}
                className="flex-1 rounded-2xl border border-border bg-surface p-4"
              >
                <View className="flex-row items-center gap-2">
                  <FinoraIcon name={item.icon} size={20} color={colors.tint} />
                  <Text className="text-sm text-muted">{item.label}</Text>
                </View>
                <Text className="mt-3 text-xl font-bold text-foreground">{item.value}</Text>
                <Text className="mt-1 text-xs text-muted">Kỳ hiện tại</Text>
              </View>
            ))}
          </View>

          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Thao tác nhanh</Text>
              <Text className="text-xs text-muted">Ghi nhanh trước, phân tích sau</Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  className="w-[48%] rounded-2xl border border-border bg-surface p-4 active:opacity-80"
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-background">
                    <FinoraIcon name={action.icon} size={23} color={colors.tint} />
                  </View>
                  <Text className="mt-3 text-sm font-semibold text-foreground">
                    {action.label}
                  </Text>
                  <Text className="mt-1 text-xs text-muted">{action.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="rounded-2xl border border-border bg-surface p-5">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-background">
                <FinoraIcon name="07_navigation_transactions" size={22} color={colors.tint} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-foreground">Giao dịch gần đây</Text>
                <Text className="mt-0.5 text-xs text-muted">Hoạt động mới nhất của bạn</Text>
              </View>
            </View>
            <View className="mt-4 items-center rounded-xl bg-background px-4 py-6">
              <FinoraIcon name="07_navigation_transactions" size={28} color={colors.icon} />
              <Text className="mt-2 text-sm font-medium text-foreground">Chưa có giao dịch</Text>
              <Text className="mt-1 text-center text-xs text-muted">
                Thêm giao dịch đầu tiên để bắt đầu theo dõi tài chính.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
