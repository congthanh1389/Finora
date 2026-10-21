import AsyncStorage from "@react-native-async-storage/async-storage";

export type DefaultReportPeriod = "today" | "week" | "month" | "quarter" | "year";
export type FinancialPreferences = {
  defaultWalletId: number | null;
  defaultIncomeCategoryId: number | null;
  defaultExpenseCategoryId: number | null;
  budgetAlertsEnabled: boolean;
  budgetAlertThreshold: number;
  defaultReportPeriod: DefaultReportPeriod;
  weekStartsOn: 0 | 1;
};

export const DEFAULT_FINANCIAL_PREFERENCES: FinancialPreferences = {
  defaultWalletId: null,
  defaultIncomeCategoryId: null,
  defaultExpenseCategoryId: null,
  budgetAlertsEnabled: true,
  budgetAlertThreshold: 80,
  defaultReportPeriod: "month",
  weekStartsOn: 1,
};

function keyFor(userId: number) {
  return `finora:financial-preferences:${userId}`;
}

export async function getFinancialPreferences(userId: number): Promise<FinancialPreferences> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return { ...DEFAULT_FINANCIAL_PREFERENCES };
  try {
    const parsed = JSON.parse(raw) as Partial<FinancialPreferences>;
    const allowedPeriods: DefaultReportPeriod[] = ["today", "week", "month", "quarter", "year"];
    return {
      ...DEFAULT_FINANCIAL_PREFERENCES,
      ...parsed,
      defaultWalletId: Number.isSafeInteger(parsed.defaultWalletId) && Number(parsed.defaultWalletId) > 0 ? Number(parsed.defaultWalletId) : null,
      defaultIncomeCategoryId: Number.isSafeInteger(parsed.defaultIncomeCategoryId) && Number(parsed.defaultIncomeCategoryId) > 0 ? Number(parsed.defaultIncomeCategoryId) : null,
      defaultExpenseCategoryId: Number.isSafeInteger(parsed.defaultExpenseCategoryId) && Number(parsed.defaultExpenseCategoryId) > 0 ? Number(parsed.defaultExpenseCategoryId) : null,
      budgetAlertsEnabled: parsed.budgetAlertsEnabled !== false,
      budgetAlertThreshold: [50, 60, 70, 80, 90].includes(Number(parsed.budgetAlertThreshold)) ? Number(parsed.budgetAlertThreshold) : 80,
      defaultReportPeriod: allowedPeriods.includes(parsed.defaultReportPeriod as DefaultReportPeriod) ? parsed.defaultReportPeriod as DefaultReportPeriod : "month",
      weekStartsOn: parsed.weekStartsOn === 0 ? 0 : 1,
    };
  } catch {
    return { ...DEFAULT_FINANCIAL_PREFERENCES };
  }
}

export async function saveFinancialPreferences(userId: number, preferences: FinancialPreferences): Promise<void> {
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Tài khoản không hợp lệ.");
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(preferences));
}
