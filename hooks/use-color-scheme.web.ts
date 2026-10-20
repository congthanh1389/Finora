import { useThemeContext } from "@/lib/theme-provider";

/** Uses the shared preference so web and native resolve the same app theme. */
export function useColorScheme() {
  return useThemeContext().colorScheme;
}
