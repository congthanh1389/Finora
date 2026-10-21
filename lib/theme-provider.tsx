import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, Platform, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

export type ThemeMode = "system" | ColorScheme;

const THEME_MODE_STORAGE_KEY = "@finora/appearance-mode:v1";
const THEME_BRIGHTNESS_STORAGE_KEY = "@finora/appearance-brightness:v1";

function adjustThemeColor(hex: string, brightness: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const amount = ((brightness - 50) / 50) * 0.14;
  const source = match[1];
  const channels = [0, 2, 4].map((offset) => parseInt(source.slice(offset, offset + 2), 16));
  const adjusted = channels.map((channel) => {
    const target = amount >= 0 ? 255 : 0;
    return Math.round(channel + (target - channel) * Math.abs(amount));
  });
  return `#${adjusted.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

type ThemeContextValue = {
  /** Resolved scheme currently applied to components. */
  colorScheme: ColorScheme;
  /** User preference, including whether to follow the operating system. */
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  /** User-controlled brightness for background and surface colors, from 0 to 100. */
  brightness: number;
  setBrightness: (brightness: number) => Promise<void>;
  backgroundColor: string;
  surfaceColor: string;
  /** Backwards-compatible explicit light/dark setter used by the theme lab. */
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme: ColorScheme = useSystemColorScheme() === "dark" ? "dark" : "light";
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [brightness, setBrightnessState] = useState(50);
  const [isHydrated, setIsHydrated] = useState(false);
  const colorScheme: ColorScheme = themeMode === "system" ? systemScheme : themeMode;
  const backgroundColor = adjustThemeColor(SchemeColors[colorScheme].background, brightness);
  const surfaceColor = adjustThemeColor(SchemeColors[colorScheme].surface, brightness);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(THEME_MODE_STORAGE_KEY),
      AsyncStorage.getItem(THEME_BRIGHTNESS_STORAGE_KEY),
    ])
      .then(([savedMode, savedBrightness]) => {
        if (!active) return;
        if (isThemeMode(savedMode)) setThemeModeState(savedMode);
        if (savedBrightness !== null) {
          const parsedBrightness = Number(savedBrightness);
          if (Number.isFinite(parsedBrightness)) {
            setBrightnessState(Math.max(0, Math.min(100, Math.round(parsedBrightness / 5) * 5)));
          }
        }
      })
      .catch((error) => {
        console.warn("[Theme] Could not load saved appearance preferences", error);
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

  const setBrightness = useCallback(async (value: number) => {
    const nextBrightness = Math.max(0, Math.min(100, Math.round(value / 5) * 5));
    setBrightnessState(nextBrightness);
    try {
      await AsyncStorage.setItem(THEME_BRIGHTNESS_STORAGE_KEY, String(nextBrightness));
    } catch (error) {
      console.error("[Theme] Could not save appearance brightness", error);
      throw new Error("Không thể lưu độ sáng giao diện. Vui lòng thử lại.");
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
        "color-background": backgroundColor,
        "color-surface": surfaceColor,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme, backgroundColor, surfaceColor],
  );

  const value = useMemo(
    () => ({ colorScheme, themeMode, setThemeMode, setColorScheme, brightness, setBrightness, backgroundColor, surfaceColor }),
    [colorScheme, themeMode, setThemeMode, setColorScheme, brightness, setBrightness, backgroundColor, surfaceColor],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1, backgroundColor }, themeVariables]}>
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
