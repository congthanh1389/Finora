import { startOAuthLogin } from "@/constants/oauth";
import { ThemedView } from "@/components/themed-view";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await startOAuthLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể mở đăng nhập");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-foreground">Finora</Text>
        <Text className="mt-3 text-center text-base text-muted-foreground">
          Đăng nhập để quản lý tài chính của bạn
        </Text>

        <Pressable
          className="mt-8 w-full items-center rounded-xl bg-primary px-5 py-4"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Đăng nhập</Text>
          )}
        </Pressable>

        {error ? (
          <Text className="mt-4 text-center text-sm text-error">{error}</Text>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}
