import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, Platform, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

export type ThemeMode = "system" | ColorScheme;

const THEME_MODE_STORAGE_KEY = "@finora/appearance-mode:v1";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

type ThemeContextValue = {
  /** Resolved scheme currently applied to components. */
  colorScheme: ColorScheme;
  /** User preference, including whether to follow the operating system. */
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  /** Backwards-compatible explicit light/dark setter used by the theme lab. */
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme: ColorScheme = useSystemColorScheme() === "dark" ? "dark" : "light";
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isHydrated, setIsHydrated] = useState(false);
  const colorScheme: ColorScheme = themeMode === "system" ? systemScheme : themeMode;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)
      .then((savedMode) => {
        if (active && isThemeMode(savedMode)) setThemeModeState(savedMode);
      })
      .catch((error) => {
        console.warn("[Theme] Could not load saved appearance preference", error);
      })
      .finally(() => {
        if (active) setIsHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const applyScheme = useCallback((scheme: ColorScheme, mode: ThemeMode) => {
    nativewindColorScheme.set(scheme);
    // "unspecified" returns React Native to following the operating-system setting.
    Appearance.setColorScheme?.(mode === "system" ? "unspecified" : scheme);

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      Object.entries(SchemeColors[scheme]).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  useEffect(() => {
    applyScheme(colorScheme, themeMode);
  }, [applyScheme, colorScheme, themeMode]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("[Theme] Could not save appearance preference", error);
      throw new Error("Không thể lưu lựa chọn giao diện. Vui lòng thử lại.");
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    void setThemeMode(scheme).catch(() => {
      // The development theme lab is best-effort; the Appearance screen reports errors to users.
    });
  }, [setThemeMode]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({ colorScheme, themeMode, setThemeMode, setColorScheme }),
    [colorScheme, themeMode, setThemeMode, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1, backgroundColor: SchemeColors[colorScheme].background }, themeVariables]}>
        {(isHydrated || Platform.OS === "web") ? children : null}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
