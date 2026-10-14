import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

type Props = { name: string; width?: number; height?: number };

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  income: "trending-up",
  expense: "shopping-bag",
  transfer: "repeat",
  food: "coffee",
  salary: "briefcase",
  shopping: "shopping-bag",
  transport: "truck",
  health: "heart",
  education: "book-open",
  home: "home",
  cash: "dollar-sign",
  bank: "credit-card",
  wallet: "credit-card",
  default: "tag",
};

export function categoryIconName(name: string, type?: string) {
  const key = name.toLowerCase();
  if (ICONS[key]) return key;
  if (type === "income") return "income";
  if (type === "expense") return "expense";
  return "default";
}

export function walletIconName(type: string) {
  const key = type.toLowerCase();
  if (key.includes("cash") || key.includes("tiền mặt")) return "cash";
  if (key.includes("bank") || key.includes("ngân hàng")) return "bank";
  return "wallet";
}

export function FinoraAssetIcon({ name, width = 42, height = 42 }: Props) {
  const icon = ICONS[name] ?? ICONS.default;
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 14,
        backgroundColor: "#E8F8F1",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name={icon} size={Math.min(width, height) * 0.48} color="#15966A" />
    </View>
  );
}
