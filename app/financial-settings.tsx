import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import * as Auth from "@/lib/_core/auth";
import { useThemeContext } from "@/lib/theme-provider";
import { createWalletDependencies } from "@/src/modules/wallet/wallet.factory";
import { createCategoryDependencies } from "@/src/modules/category/category.factory";
import type { WalletSummary } from "@/src/modules/wallet/types/wallet.types";
import type { Category } from "@/drizzle/schema";
import {
  DEFAULT_FINANCIAL_PREFERENCES,
  getFinancialPreferences,
  saveFinancialPreferences,
  type FinancialPreferences,
  type DefaultReportPeriod,
} from "@/src/core/settings/financial-preferences";

const PERIODS: { value: DefaultReportPeriod; label: string }[] = [
  { value: "today", label: "Hôm nay" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "quarter", label: "Quý" },
  { value: "year", label: "Năm" },
];

export default function FinancialSettingsScreen() {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  const [preferences, setPreferences] = useState<FinancialPreferences>(DEFAULT_FINANCIAL_PREFERENCES);
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const colors = useMemo(() => ({
    background: dark ? "#10211F" : "#EAF9F4",
    card: dark ? "#17322D" : "#FFFFFF",
    text: dark ? "#E7F5F0" : "#164F4B",
    muted: dark ? "#A5BCB5" : "#718C8A",
    border: dark ? "#31554B" : "#CDEDE4",
    accent: dark ? "#51D3B2" : "#22B8A8",
    selected: dark ? "#1C4038" : "#E2FBF5",
  }), [dark]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const user = await Auth.getUserInfo();
        if (!user) throw new Error("Vui lòng đăng nhập để thiết lập tài chính.");
        const [prefs, walletRows, incomeRows, expenseRows] = await Promise.all([
          getFinancialPreferences(user.id),
          createWalletDependencies().walletService.listWallets(user.id),
          createCategoryDependencies().categoryService.listCategories(user.id, "income"),
          createCategoryDependencies().categoryService.listCategories(user.id, "expense"),
        ]);
        if (!active) return;
        setUserId(user.id);
        setPreferences(prefs);
        setWallets(walletRows.filter((wallet) => !wallet.isArchived));
        setIncomeCategories(incomeRows.filter((item) => item.isArchived === 0));
        setExpenseCategories(expenseRows.filter((item) => item.isArchived === 0));
      } catch (error) {
        if (active) Alert.alert("Không thể tải thiết lập", error instanceof Error ? error.message : "Vui lòng thử lại.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const update = <K extends keyof FinancialPreferences>(key: K, value: FinancialPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      const safePreferences = {
        ...preferences,
        defaultWalletId: wallets.some((item) => item.id === preferences.defaultWalletId) ? preferences.defaultWalletId : null,
        defaultIncomeCategoryId: incomeCategories.some((item) => item.id === preferences.defaultIncomeCategoryId) ? preferences.defaultIncomeCategoryId : null,
        defaultExpenseCategoryId: expenseCategories.some((item) => item.id === preferences.defaultExpenseCategoryId) ? preferences.defaultExpenseCategoryId : null,
      };
      await saveFinancialPreferences(userId, safePreferences);
      setPreferences(safePreferences);
      Alert.alert("Đã lưu", "Thiết lập tài chính đã được lưu trên thiết bị.");
    } catch (error) {
      Alert.alert("Không thể lưu", error instanceof Error ? error.message : "Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const option = (label: string, selected: boolean, onPress: () => void, detail?: string) => (
    <Pressable key={label} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.selected : colors.card, borderRadius: 15, padding: 12, marginTop: 8 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: selected ? "800" : "600" }}>{label}</Text>
        {detail ? <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>{detail}</Text> : null}
      </View>
      {selected ? <Feather name="check-circle" size={19} color={colors.accent} /> : <View style={{ width: 19, height: 19, borderWidth: 1, borderColor: colors.border, borderRadius: 10 }} />}
    </Pressable>
  );

  const section = (title: string, description: string, children: React.ReactNode) => (
    <View style={{ marginTop: 16, borderRadius: 22, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, padding: 16 }}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{description}</Text>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại" style={{ width: 42, height: 42, justifyContent: "center" }}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Thiết lập tài chính</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Quy tắc chung cho tài khoản này</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
        {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
          <>
            {section("A. Mặc định giao dịch", "Chọn trước ví và danh mục để nhập giao dịch nhanh hơn.",
              <>
                <Text style={{ color: colors.text, fontWeight: "700", marginTop: 4 }}>Ví mặc định</Text>
                {option("Không đặt mặc định", preferences.defaultWalletId === null, () => update("defaultWalletId", null), "Finora sẽ dùng ví đầu tiên đang hoạt động nếu bạn chưa chọn.")}
                {wallets.map((wallet) => option(wallet.name, preferences.defaultWalletId === wallet.id, () => update("defaultWalletId", wallet.id), wallet.currency))}
                {wallets.length === 0 ? <Text style={{ color: colors.muted, marginTop: 8 }}>Chưa có ví đang hoạt động. Hãy tạo ví trong “Ví của tôi”.</Text> : null}
                <Text style={{ color: colors.text, fontWeight: "700", marginTop: 18 }}>Danh mục thu mặc định</Text>
                {option("Không đặt mặc định", preferences.defaultIncomeCategoryId === null, () => update("defaultIncomeCategoryId", null))}
                {incomeCategories.map((item) => option(item.name, preferences.defaultIncomeCategoryId === item.id, () => update("defaultIncomeCategoryId", item.id)))}
                <Text style={{ color: colors.text, fontWeight: "700", marginTop: 18 }}>Danh mục chi mặc định</Text>
                {option("Không đặt mặc định", preferences.defaultExpenseCategoryId === null, () => update("defaultExpenseCategoryId", null))}
                {expenseCategories.map((item) => option(item.name, preferences.defaultExpenseCategoryId === item.id, () => update("defaultExpenseCategoryId", item.id))}
              </>
            )}
            {section("B. Cảnh báo ngân sách", "Điều chỉnh khi Finora bắt đầu nhắc bạn về ngân sách. Cảnh báo vượt hạn mức luôn được giữ khi bật tính năng.",
              <>
                {option("Bật cảnh báo ngân sách", preferences.budgetAlertsEnabled, () => update("budgetAlertsEnabled", true))}
                {option("Tắt cảnh báo ngân sách", !preferences.budgetAlertsEnabled, () => update("budgetAlertsEnabled", false))}
                <Text style={{ color: colors.text, fontWeight: "700", marginTop: 16 }}>Ngưỡng cảnh báo sắp chạm hạn mức</Text>
                {[50, 60, 70, 80, 90].map((value) => option(`${value}% ngân sách`, preferences.budgetAlertThreshold === value, () => update("budgetAlertThreshold", value)))}
              </>
            )}
            {section("C. Quy tắc thời gian", "Thiết lập kỳ báo cáo mặc định và ngày bắt đầu tuần.",
              <>
                <Text style={{ color: colors.text, fontWeight: "700" }}>Kỳ báo cáo mặc định</Text>
                {PERIODS.map((period) => option(period.label, preferences.defaultReportPeriod === period.value, () => update("defaultReportPeriod", period.value)))}
                <Text style={{ color: colors.text, fontWeight: "700", marginTop: 16 }}>Tuần bắt đầu vào</Text>
                {option("Thứ Hai", preferences.weekStartsOn === 1, () => update("weekStartsOn", 1))}
                {option("Chủ nhật", preferences.weekStartsOn === 0, () => update("weekStartsOn", 0))}
              </>
            )}
            <Pressable onPress={() => void save()} disabled={saving} style={{ marginTop: 20, backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 15, alignItems: "center", opacity: saving ? 0.7 : 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>{saving ? "Đang lưu..." : "Lưu thiết lập"}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
