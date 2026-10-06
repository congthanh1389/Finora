import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

type MdiName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export const EXPENSE_CATEGORY_ICONS = [
  { name: "food-noodles", label: "Ăn uống" },
  { name: "cart-outline", label: "Mua sắm" },
  { name: "home-outline", label: "Nhà cửa" },
  { name: "car-outline", label: "Đi lại" },
  { name: "gas-station-outline", label: "Xăng xe" },
  { name: "heart-pulse", label: "Sức khỏe" },
  { name: "school-outline", label: "Học tập" },
  { name: "tshirt-crew-outline", label: "Quần áo" },
  { name: "cellphone", label: "Điện thoại" },
  { name: "lightbulb-outline", label: "Điện nước" },
  { name: "gamepad-variant-outline", label: "Giải trí" },
  { name: "coffee-outline", label: "Cà phê" },
  { name: "dumbbell", label: "Thể thao" },
  { name: "airplane", label: "Du lịch" },
  { name: "dog", label: "Thú cưng" },
  { name: "gift-outline", label: "Quà tặng" },
  { name: "account-group-outline", label: "Gia đình" },
  { name: "credit-card-outline", label: "Phí ngân hàng" },
  { name: "package-variant-closed", label: "Khác" },
] as const;

export const INCOME_CATEGORY_ICONS = [
  { name: "briefcase-outline", label: "Lương" },
  { name: "cash-plus", label: "Thưởng" },
  { name: "chart-line", label: "Đầu tư" },
  { name: "bank-outline", label: "Lãi tiết kiệm" },
  { name: "home-city-outline", label: "Cho thuê" },
  { name: "handshake-outline", label: "Làm thêm" },
  { name: "gift-outline", label: "Quà tặng" },
  { name: "cash-refund", label: "Hoàn tiền" },
  { name: "cash-multiple", label: "Thu nhập khác" },
] as const;

export type CategoryIconName =
  | typeof EXPENSE_CATEGORY_ICONS[number]["name"]
  | typeof INCOME_CATEGORY_ICONS[number]["name"]
  | "other";

export function CategoryIcon({
  name,
  size = 28,
  color = "#0F766E",
}: {
  name: CategoryIconName;
  size?: number;
  color?: string;
}) {
  const icon = name === "other" ? "package-variant-closed" : name;
  return <MaterialCommunityIcons name={icon as MdiName} size={size} color={color} />;
}
