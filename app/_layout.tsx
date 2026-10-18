import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
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
import { AppErrorBoundary } from "@/src/core/ui/app-error-boundary";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };
const DEVICE_RUNTIME_TIMEOUT_MS = 15_000;

// Keep the native splash visible until bootstrap has either succeeded or failed.
// The React UI below always takes over, including when initialization fails.
if (Platform.OS !== "web") {
  void SplashScreen.preventAutoHideAsync().catch((error) => {
    console.warn("[Finora] Could not hold native splash screen", error);
  });
}

function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

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

type BootstrapStatus = "loading" | "ready" | "error";

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>("loading");
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    initManusRuntime();
  }, []);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Khởi tạo bộ nhớ trên thiết bị quá lâu. Vui lòng thử lại Finora.")),
        DEVICE_RUNTIME_TIMEOUT_MS,
      );
    });

    const bootstrap = async () => {
      try {
        const info = await Promise.race([initializeDeviceRuntime(), timeout]);
        if (!active) return;
        console.log("[Finora] Device runtime ready", info);
        setBootstrapError(null);
        setBootstrapStatus("ready");
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Không thể khởi tạo bộ nhớ Finora.";
        console.error("[Finora] Device runtime initialization failed", error);
        setBootstrapError(message);
        setBootstrapStatus("error");
      } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        if (active && Platform.OS !== "web") {
          try {
            await SplashScreen.hideAsync();
            console.log("[Finora] Native splash dismissed");
          } catch (error) {
            console.warn("[Finora] Splash screen hide failed", error);
          }
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [retryCount]);

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

  const retryBootstrap = () => {
    setBootstrapError(null);
    setBootstrapStatus("loading");
    setRetryCount((count) => count + 1);
  };

  const bootstrapScreen =
    bootstrapStatus === "loading" ? (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          padding: 24,
        }}
      >
        <ActivityIndicator size="large" color="#00BFA5" />
        <Text style={{ marginTop: 14, color: "#334155", fontSize: 15 }}>
          Finora đang khởi tạo bộ nhớ trên thiết bị...
        </Text>
      </View>
    ) : bootstrapStatus === "error" ? (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          padding: 24,
        }}
      >
        <Text style={{ color: "#0F172A", fontSize: 22, fontWeight: "700", textAlign: "center" }}>
          Finora chưa thể khởi động
        </Text>
        <Text style={{ marginTop: 12, color: "#475569", fontSize: 15, lineHeight: 22, textAlign: "center" }}>
          {bootstrapError ?? "Đã xảy ra lỗi khi khởi tạo bộ nhớ trên thiết bị."}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={retryBootstrap}
          style={{
            marginTop: 22,
            borderRadius: 12,
            backgroundColor: "#00A88F",
            paddingHorizontal: 22,
            paddingVertical: 13,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Thử khởi động lại</Text>
        </Pressable>
      </View>
    ) : (
      <AuthGate />
    );

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {bootstrapScreen}
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <AppErrorBoundary>
        <ThemeProvider>
          <SafeAreaProvider initialMetrics={providerInitialMetrics}>
            <SafeAreaFrameContext.Provider value={frame}>
              <SafeAreaInsetsContext.Provider value={insets}>
                {content}
              </SafeAreaInsetsContext.Provider>
            </SafeAreaFrameContext.Provider>
          </SafeAreaProvider>
        </ThemeProvider>
      </AppErrorBoundary>
    );
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
