import * as Auth from "@/lib/_core/auth";
import { ThemedView } from "@/components/themed-view";
import { notifyAuthState } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      let user: Auth.User;
      if (registerMode) {
        user = await Auth.localRegister({ email, name, password });
      } else {
        user = await Auth.localLogin(email, password);
      }

      notifyAuthState(user);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    Alert.alert(
      "Đặt lại mật khẩu",
      "Chức năng đặt lại mật khẩu qua email sẽ được bổ sung ở module tiếp theo.",
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6">
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/icon.png")}
            className="h-32 w-32"
            resizeMode="contain"
            accessibilityLabel="Logo Finora"
          />

          <Text className="mt-3 text-4xl font-bold text-foreground">Finora</Text>

          <Text className="mt-2 text-center text-base text-muted-foreground">
            {registerMode
              ? "Tạo tài khoản Finora"
              : "Đăng nhập để quản lý tài chính của bạn"}
          </Text>

          <View className="mt-8 w-full">
            {registerMode ? (
              <TextInput
                className="w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground"
                placeholder="Họ và tên"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            ) : null}

            <TextInput
              className={`${registerMode ? "mt-3" : ""} w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground`}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <View className="mt-3 w-full flex-row items-center rounded-xl border border-border bg-background">
              <TextInput
                className="flex-1 px-4 py-4 text-foreground"
                placeholder="Mật khẩu"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                className="px-4 py-4"
                onPress={() => setShowPassword((value) => !value)}
                disabled={loading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={23}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {!registerMode ? (
              <TouchableOpacity
                className="mt-3 self-end px-1 py-1"
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Quên mật khẩu"
              >
                <Text className="text-sm font-medium text-primary">Quên mật khẩu?</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              className="mt-5 w-full items-center rounded-xl bg-primary px-5 py-4"
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={registerMode ? "Tạo tài khoản" : "Đăng nhập"}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  {registerMode ? "Tạo tài khoản" : "Đăng nhập"}
                </Text>
              )}
            </TouchableOpacity>

            {error ? (
              <Text className="mt-4 text-center text-sm text-error">{error}</Text>
            ) : null}

            <TouchableOpacity
              className="mt-5 items-center py-1"
              onPress={() => {
                setError(null);
                setShowPassword(false);
                setRegisterMode((value) => !value);
              }}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={registerMode ? "Đăng nhập" : "Đăng ký"}
            >
              <Text className="text-sm text-primary">
                {registerMode ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
