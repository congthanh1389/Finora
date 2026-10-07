import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

type MdiName = ComponentProps<typeof MaterialCommunityIcons>["name"];

import {
  EXPENSE_CATEGORY_ICONS,
  INCOME_CATEGORY_ICONS,
  type CategoryIconName,
} from "./category-icon-data";

export { EXPENSE_CATEGORY_ICONS, INCOME_CATEGORY_ICONS };
export type { CategoryIconName };

const CATEGORY_COLORS = [
  "#F97316",
  "#2563EB",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#E11D48",
  "#7C3AED",
  "#DB2777",
  "#0891B2",
  "#16A34A",
  "#8B5CF6",
  "#92400E",
  "#EA580C",
  "#0284C7",
  "#65A30D",
  "#D97706",
  "#4F46E5",
  "#0F766E",
  "#64748B",
] as const;

export type CategoryIconName =
  | typeof EXPENSE_CATEGORY_ICONS[number]["name"]
  | typeof INCOME_CATEGORY_ICONS[number]["name"]
  | "other";

export function CategoryIcon({
  name,
  size = 28,
  color,
}: {
  name: CategoryIconName;
  size?: number;
  color?: string;
}) {
  const icon = name === "other" ? "package-variant-closed" : name;
  const allIcons = [...EXPENSE_CATEGORY_ICONS, ...INCOME_CATEGORY_ICONS];
  const index = Math.max(
    0,
    allIcons.findIndex((item) => item.name === name),
  );
  const resolvedColor = color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length];

  return (
    <MaterialCommunityIcons
      name={icon as MdiName}
      size={size}
      color={resolvedColor}
    />
  );
}
