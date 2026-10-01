import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { FinoraIcon } from "@/components/ui/finora-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const quickActions = [
  { icon: "08_actions_add", label: "Thêm giao dịch" },
  { icon: "01_finance_wallet", label: "Ví của tôi" },
  { icon: "02_management_budget", label: "Ngân sách" },
  { icon: "04_reports_report", label: "Báo cáo" },
] as const;

export default function HomeScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6 pb-8">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <FinoraIcon name="00_brand_finora_mark" size={30} color={colors.background} />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted">Finora</Text>
              <Text className="text-2xl font-bold text-foreground">Tổng quan</Text>
            </View>
            <FinoraIcon name="05_calendar_notifications_notification" size={24} color={colors.icon} />
          </View>

          <View className="rounded-3xl bg-primary p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-background/80">Tổng số dư</Text>
              <FinoraIcon name="01_finance_wallet" size={22} color={colors.background} />
            </View>
            <Text className="mt-3 text-4xl font-bold text-background">—</Text>
            <Text className="mt-1 text-sm text-background/70">Chưa có dữ liệu giao dịch</Text>
          </View>

          <View>
            <Text className="mb-3 text-lg font-semibold text-foreground">Truy cập nhanh</Text>
            <View className="flex-row flex-wrap gap-3">
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.icon}
                  className="w-[47%] rounded-2xl border border-border bg-surface p-4 active:opacity-80"
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <FinoraIcon name={action.icon} size={24} color={colors.tint} />
                  <Text className="mt-3 text-sm font-semibold text-foreground">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="rounded-2xl border border-border bg-surface p-5">
            <View className="flex-row items-center gap-3">
              <FinoraIcon name="07_navigation_transactions" size={24} color={colors.tint} />
              <Text className="text-lg font-semibold text-foreground">Giao dịch gần đây</Text>
            </View>
            <Text className="mt-3 text-sm leading-5 text-muted">
              Các giao dịch sẽ xuất hiện tại đây sau khi module Transaction và Repository được triển khai.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
