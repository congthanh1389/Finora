import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import * as Auth from "@/lib/_core/auth";

function PasswordField({
  label, value, onChangeText, visible, onToggle, placeholder, disabled,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ color: "#344A45", fontSize: 13, fontWeight: "700", marginBottom: 8 }}>{label}</Text>
      <View style={{ minHeight: 54, flexDirection: "row", alignItems: "center", borderRadius: 15, borderWidth: 1, borderColor: "#DCE7E2", backgroundColor: "#FFFFFF" }}>
        <TextInput
          style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 14, color: "#172033", fontSize: 15 }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          textContentType="none"
        />
        <TouchableOpacity onPress={onToggle} disabled={disabled} accessibilityRole="button" accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} style={{ padding: 14 }}>
          <Feather name={visible ? "eye-off" : "eye"} size={19} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!user || user.loginMethod !== "local-password") {
      setError("Chức năng này chỉ áp dụng cho tài khoản đăng ký bằng mật khẩu trên thiết bị.");
      return;
    }
    if (!currentPassword) return setError("Vui lòng nhập mật khẩu hiện tại.");
    if (newPassword.length < 6) return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
    if (newPassword === currentPassword) return setError("Mật khẩu mới phải khác mật khẩu hiện tại.");

    try {
      setLoading(true);
      await Auth.localChangePassword(user.id, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Đổi mật khẩu thành công", "Mật khẩu đăng nhập của bạn đã được cập nhật.", [
        { text: "Hoàn tất", onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <ScreenContainer className="bg-[#F5F8F7]">
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingVertical: 8, marginBottom: 20 }} accessibilityRole="button" accessibilityLabel="Quay lại">
          <Feather name="arrow-left" size={19} color="#12664D" />
          <Text style={{ color: "#12664D", fontWeight: "700", marginLeft: 8 }}>Cài đặt</Text>
        </TouchableOpacity>

        <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: "#DDF7EB", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Feather name="key" size={27} color="#12664D" />
        </View>
        <Text style={{ color: "#122D2A", fontSize: 27, fontWeight: "800" }}>Đổi mật khẩu</Text>
        <Text style={{ color: "#72817F", fontSize: 14, lineHeight: 21, marginTop: 8 }}>
          Nhập mật khẩu hiện tại, sau đó tạo mật khẩu mới có ít nhất 6 ký tự.
        </Text>

        <PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} visible={showCurrent} onToggle={() => setShowCurrent((v) => !v)} placeholder="Nhập mật khẩu hiện tại" disabled={loading} />
        <PasswordField label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} visible={showNew} onToggle={() => setShowNew((v) => !v)} placeholder="Ít nhất 6 ký tự" disabled={loading} />
        <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChangeText={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} placeholder="Nhập lại mật khẩu mới" disabled={loading} />

        {error ? <View style={{ marginTop: 16, borderRadius: 12, backgroundColor: "#FFF1F2", padding: 12 }}>
          <Text style={{ color: "#BE123C", fontSize: 13, lineHeight: 19 }}>{error}</Text>
        </View> : null}

        <TouchableOpacity onPress={submit} disabled={loading} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Lưu mật khẩu mới" style={{ minHeight: 54, marginTop: 24, borderRadius: 17, backgroundColor: loading ? "#7BB6A1" : "#138363", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Feather name="check" size={18} color="#FFFFFF" />}
          <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginLeft: 9 }}>{loading ? "Đang cập nhật..." : "Lưu mật khẩu mới"}</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
