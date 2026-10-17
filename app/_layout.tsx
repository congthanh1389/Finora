import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
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

function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, error, refresh } = useAuth();

  useEffect(() => {
    if (loading || error) return;

    const isPublicRoute = pathname === "/login" || pathname === "/oauth/callback";
    if (!user && !isPublicRoute) {
      router.replace("/login" as never);
    } else if (user && pathname === "/login") {
      router.replace("/(tabs)");
    }
  }, [error, loading, pathname, router, user]);

  return (
    <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="oauth/callback" />
      <Stack.Screen name="account-list" />
      <Stack.Screen name="backup-restore" />
    </Stack>
    {!loading && error ? (
      <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F8FAFC" }}>
        <View style={{ width: "100%", maxWidth: 420, borderRadius: 20, padding: 24, backgroundColor: "#FFFFFF" }}>
          <Text style={{ color: "#0F172A", fontSize: 22, fontWeight: "700", textAlign: "center" }}>Không thể kiểm tra đăng nhập</Text>
          <Text selectable style={{ color: "#475569", fontSize: 14, lineHeight: 21, marginTop: 12, textAlign: "center" }}>{error.message || "Finora chưa đọc được trạng thái tài khoản."}</Text>
          <Pressable accessibilityRole="button" onPress={() => void refresh()} style={{ alignItems: "center", backgroundColor: "#10B981", borderRadius: 12, marginTop: 20, paddingVertical: 13 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Thử lại</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/login" as never)} style={{ alignItems: "center", borderColor: "#CBD5E1", borderRadius: 12, borderWidth: 1, marginTop: 10, paddingVertical: 13 }}>
            <Text style={{ color: "#334155", fontSize: 15, fontWeight: "600" }}>Mở màn hình đăng nhập</Text>
          </Pressable>
        </View>
      </View>
    ) : null}
    </>
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
  const [runtimeRetryKey, setRuntimeRetryKey] = useState(0);

  useEffect(() => {
    initManusRuntime();
  }, []);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    setRuntimeError(null);
    const runtimeInitialization = initializeDeviceRuntime();
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Finora mất quá 15 giây để khởi tạo bộ nhớ. Hãy thử lại; thao tác này không xóa dữ liệu.")),
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
          error instanceof Error ? error.message : String(error ?? "Không thể khởi tạo bộ nhớ Finora.");
        console.error("[Finora] Device runtime initialization failed", error);
        setRuntimeError(message);
      })
      .finally(() => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      });

    return () => {
      active = false;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [runtimeRetryKey]);

  useEffect(() => {
    if ((!runtimeReady && !runtimeError) || Platform.OS === "web") return;
    void SplashScreen.hideAsync().catch((error) => {
      console.warn("[Finora] Splash screen hide failed", error);
    });
  }, [runtimeReady, runtimeError]);

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
          {runtimeReady ? <AuthGate /> : null}
          <StatusBar style="auto" />
          {!runtimeReady ? (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                backgroundColor: "#F8FAFC",
              }}
            >
              <View style={{ width: "100%", maxWidth: 420, borderRadius: 20, padding: 24, backgroundColor: "#FFFFFF" }}>
                <Text style={{ color: "#0F172A", fontSize: 22, fontWeight: "700", textAlign: "center" }}>
                  {runtimeError ? "Finora chưa khởi tạo được" : "Đang mở Finora"}
                </Text>
                {runtimeError ? (
                  <>
                    <Text selectable style={{ color: "#475569", fontSize: 14, lineHeight: 21, marginTop: 12, textAlign: "center" }}>
                      {runtimeError}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setRuntimeReady(false);
                        setRuntimeError(null);
                        setRuntimeRetryKey((value) => value + 1);
                      }}
                      style={{ alignItems: "center", backgroundColor: "#10B981", borderRadius: 12, marginTop: 20, paddingVertical: 13 }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Thử khởi tạo lại</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <ActivityIndicator style={{ marginTop: 18 }} />
                    <Text style={{ color: "#475569", fontSize: 14, marginTop: 12, textAlign: "center" }}>
                      Đang chuẩn bị bộ nhớ trên thiết bị...
                    </Text>
                  </>
                )}
              </View>
            </View>
          ) : null}
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
