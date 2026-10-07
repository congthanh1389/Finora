import {
  EXPENSE_CATEGORY_ICONS,
  INCOME_CATEGORY_ICONS,
  type CategoryIconName,
} from "../../../../components/ui/category-icons";

const CATEGORY_ICON_NAMES = new Set<string>([
  ...EXPENSE_CATEGORY_ICONS.map((item) => item.name),
  ...INCOME_CATEGORY_ICONS.map((item) => item.name),
]);

export function resolveCategoryIconName(icon?: string | null): CategoryIconName {
  if (!icon || !CATEGORY_ICON_NAMES.has(icon)) return "other";
  return icon as CategoryIconName;
}
