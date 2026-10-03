import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = registerMode
        ? await Api.localRegister(email, name, password)
        : await Api.localLogin(email, password);

      await Auth.setSessionToken(result.app_session_id);
      await Auth.setUserInfo({
        id: result.user.id,
        openId: result.user.openId,
        name: result.user.name,
        email: result.user.email,
        loginMethod: result.user.loginMethod,
        lastSignedIn: new Date(result.user.lastSignedIn),
      });

      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-foreground">Finora</Text>
        <Text className="mt-3 text-center text-base text-muted-foreground">
          {registerMode ? "Tạo tài khoản Finora" : "Đăng nhập để quản lý tài chính của bạn"}
        </Text>

        {registerMode ? (
          <TextInput
            className="mt-8 w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground"
            placeholder="Họ và tên"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          className={`${registerMode ? "mt-3" : "mt-8"} w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground`}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground"
          placeholder="Mật khẩu"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          className="mt-6 w-full items-center rounded-xl bg-primary px-5 py-4"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              {registerMode ? "Tạo tài khoản" : "Đăng nhập"}
            </Text>
          )}
        </Pressable>

        {error ? <Text className="mt-4 text-center text-sm text-error">{error}</Text> : null}

        <Pressable
          className="mt-5"
          onPress={() => {
            setError(null);
            setRegisterMode((value) => !value);
          }}
          disabled={loading}
        >
          <Text className="text-sm text-primary">
            {registerMode ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
          </Text>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}
