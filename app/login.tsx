import * as Auth from "@/lib/_core/auth";
import { apiCall } from "@/lib/_core/api";
import { ThemedView } from "@/components/themed-view";
import { notifyAuthState } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      setError(null);
      await apiCall<{ success: true }>("/api/auth/email-otp/send", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setOtpSent(true);
      setOtp("");
      setResendCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được mã OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      let user: Auth.User;
      if (registerMode) {
        if (!email.trim() || !email.includes("@")) throw new Error("Email không hợp lệ.");
        if (!name.trim()) throw new Error("Vui lòng nhập họ và tên.");
        if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        if (!otpSent) throw new Error("Vui lòng gửi mã OTP qua email trước.");

        const existingAccounts = await Auth.localGetAccounts();
        if (existingAccounts.some((account) => account.email?.trim().toLowerCase() === email.trim().toLowerCase())) {
          throw new Error("Email này đã được đăng ký trên thiết bị.");
        }

        await apiCall<{ verified: true }>("/api/auth/email-otp/verify", {
          method: "POST",
          body: JSON.stringify({ email, code: otp }),
        });
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
    router.push("/forgot-password" as never);
  };

  const resetOtpState = () => {
    setOtp("");
    setOtpSent(false);
    setResendCountdown(0);
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1 px-6">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full items-center">
          <View
            style={{
              width: 180,
              height: 180,
              borderRadius: 90,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
              accessibilityLabel="Logo Finora"
            />
          </View>

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
                editable={!loading && !sendingOtp}
              />
            ) : null}

            <TextInput
              className={`${registerMode ? "mt-3" : ""} w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground`}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                resetOtpState();
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !sendingOtp}
            />

            {registerMode ? (
              <View className="mt-3">
                <TouchableOpacity
                  className="w-full items-center rounded-xl border border-primary px-4 py-3"
                  onPress={handleSendOtp}
                  disabled={loading || sendingOtp || resendCountdown > 0}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Gửi mã OTP qua email"
                >
                  {sendingOtp ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-sm font-semibold text-primary">
                      {otpSent
                        ? resendCountdown > 0
                          ? `Gửi lại mã sau ${resendCountdown} giây`
                          : "Gửi lại mã OTP"
                        : "Gửi mã OTP qua email"}
                    </Text>
                  )}
                </TouchableOpacity>

                {otpSent ? (
                  <TextInput
                    className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-4 text-foreground"
                    placeholder="Nhập mã OTP gồm 6 chữ số"
                    placeholderTextColor="#888"
                    value={otp}
                    onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    maxLength={6}
                    editable={!loading && !sendingOtp}
                  />
                ) : null}
              </View>
            ) : null}

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
                editable={!loading && !sendingOtp}
              />
              <TouchableOpacity
                className="px-4 py-4"
                onPress={() => setShowPassword((value) => !value)}
                disabled={loading || sendingOtp}
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
              disabled={loading || sendingOtp || (registerMode && (!otpSent || otp.length !== 6))}
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
                resetOtpState();
                setRegisterMode((value) => !value);
              }}
              disabled={loading || sendingOtp}
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
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
