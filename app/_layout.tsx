import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { initializeDeviceRuntime } from "@/src/core/runtime/device-runtime";
import { useAuth } from "@/hooks/use-auth";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, refresh } = useAuth();

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === "/login" || pathname === "/oauth/callback";
    if (!user && !isPublicRoute) {
      router.replace("/login" as never);
    } else if (user && pathname === "/login") {
      router.replace("/(tabs)");
    }
  }, [loading, pathname, router, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="oauth/callback" />
      <Stack.Screen name="account-list" />
    </Stack>
  );
}

export const unstable_settings = {
  anchor: "(tabs)",
};

const DEVICE_RUNTIME_TIMEOUT_MS = 15_000;

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    initManusRuntime();
  }, []);

  useEffect(() => {
    let active = true;
    const runtimeInitialization = initializeDeviceRuntime();
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Khởi tạo bộ nhớ trên thiết bị quá lâu. Vui lòng thử mở lại Finora.")),
        DEVICE_RUNTIME_TIMEOUT_MS,
      );
    });

    void Promise.race([runtimeInitialization, timeout])
      .then((info) => {
        if (!active) return;
        console.log("[Finora] Device runtime ready", info);
        setRuntimeReady(true);
      })
      .catch((error) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Không thể khởi tạo bộ nhớ Finora.";
        console.error("[Finora] Device runtime initialization failed", error);
        setRuntimeError(message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!runtimeReady || Platform.OS === "web") return;
    void SplashScreen.hideAsync().catch((error) => {
      console.warn("[Finora] Splash screen hide failed", error);
    });
  }, [runtimeReady]);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthGate />
          <StatusBar style="auto" />
          {!runtimeReady ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
              }}
            >
              <ActivityIndicator />
              <Text style={{ marginTop: 12 }}>
                {runtimeError ?? "Đang khởi tạo bộ nhớ trên thiết bị..."}
              </Text>
            </View>
          ) : null}
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
