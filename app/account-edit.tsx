import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth, notifyAuthState } from "@/hooks/use-auth";
import { localUpdateAccountProfile } from "@/lib/_core/auth";

const C = {
  bg: "#EAF9F4",
  white: "#FFFFFF",
  mint: "#27B99A",
  dark: "#08665D",
  soft: "#E8F8F2",
  border: "#C9EEE3",
  text: "#164F4B",
  muted: "#718C8A",
  red: "#B94343",
};

export default function AccountEditScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUri, setAvatarUri] = useState(user?.avatarUri ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const chooseAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Finora cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
        setError("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể mở thư viện ảnh.");
    }
  };

  const save = async () => {
    if (!user) {
      setError("Bạn cần đăng nhập để chỉnh sửa hồ sơ.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }
    let saveStage = "khởi tạo";
    try {
      setSaving(true);
      setError("");
      console.log("[AccountEdit] save started", { userId: user.id, hasAvatar: Boolean(avatarUri) });
      saveStage = "lưu hồ sơ cục bộ";
      console.log("[AccountEdit] runtime function type:", typeof localUpdateAccountProfile);
      const updated = await localUpdateAccountProfile(user.id, name, avatarUri);
      console.log("[AccountEdit] local profile updated");
      saveStage = "cập nhật trạng thái đăng nhập";
      notifyAuthState(updated);
      console.log("[AccountEdit] auth state notified");
      saveStage = "quay lại màn hình trước";
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[AccountEdit] save failed at stage:", saveStage, e);
      if (e instanceof Error && e.stack) console.error("[AccountEdit] stack:", e.stack);
      setError(message && message !== "undefined is not a function"
        ? `Lỗi khi ${saveStage}: ${message}`
        : `Lỗi khi ${saveStage}: một hàm chưa khả dụng. Chi tiết đã được ghi vào log Android.`);
    } finally {
      setSaving(false);
    }
  };

  const initial = (name || user?.email || "F").trim().charAt(0).toUpperCase();

  return (
    <ScreenContainer className="bg-[#EAF9F4]">
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 26 }}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại" style={{ width: 42, height: 42, justifyContent: "center" }}>
            <Feather name="arrow-left" size={24} color={C.dark} />
          </TouchableOpacity>
          <Text style={{ color: C.text, fontSize: 21, fontWeight: "800", marginLeft: 12 }}>Chỉnh sửa hồ sơ</Text>
        </View>

        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 28 }}>
          <TouchableOpacity
            onPress={chooseAvatar}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Chọn ảnh đại diện"
            style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: "#B9F1E1", borderWidth: 5, borderColor: C.white, alignItems: "center", justifyContent: "center", shadowColor: "#087768", shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 }}
          >
            {avatarUri ? <Image source={{ uri: avatarUri }} style={{ width: 140, height: 140, borderRadius: 70 }} resizeMode="cover" /> : <Text style={{ color: C.dark, fontSize: 60, fontWeight: "800" }}>{initial}</Text>}
            <View pointerEvents="none" style={{ position: "absolute", right: -2, bottom: 3, width: 42, height: 42, borderRadius: 22, backgroundColor: "#07866E", borderWidth: 3, borderColor: C.white, alignItems: "center", justifyContent: "center" }}>
              <Feather name="camera" size={19} color={C.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={chooseAvatar}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Thay đổi ảnh đại diện"
            style={{ marginTop: 20, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#BCEEDF", borderRadius: 25, paddingHorizontal: 21, paddingVertical: 12 }}
          >
            <Feather name="camera" size={19} color={C.dark} style={{ marginRight: 10 }} />
            <Text style={{ color: C.dark, fontSize: 14, fontWeight: "700" }}>Chọn ảnh đại diện</Text>
          </TouchableOpacity>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 9 }}>Chạm vào ảnh để chọn hoặc thay ảnh đại diện.</Text>
        </View>

        <View style={{ backgroundColor: C.white, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#E0F4ED" }}>
          <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginBottom: 10 }}>Tên hiển thị</Text>
          <TextInput
            value={name}
            onChangeText={(value) => { setName(value); setError(""); }}
            placeholder="Nhập tên hiển thị"
            placeholderTextColor="#9BAEAA"
            maxLength={60}
            autoCapitalize="words"
            returnKeyType="done"
            style={{ minHeight: 54, borderWidth: 1.5, borderColor: "#DDE9ED", borderRadius: 15, paddingHorizontal: 15, color: C.text, fontSize: 16, backgroundColor: C.white }}
          />
          <Text style={{ textAlign: "right", color: C.muted, fontSize: 12, marginTop: 7 }}>{name.length}/60</Text>

          <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", marginTop: 20, marginBottom: 10 }}>Tên tài khoản</Text>
          <View style={{ minHeight: 54, borderWidth: 1.5, borderColor: "#E5EFEB", borderRadius: 15, paddingHorizontal: 15, justifyContent: "center", backgroundColor: "#F7FBF9" }}>
            <Text selectable style={{ color: C.muted, fontSize: 15 }}>{user?.email?.split("@")[0] || "Chưa có tên tài khoản"}</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 8 }}>Tên tài khoản được tạo từ email đăng ký và hiện chỉ hiển thị để tham khảo.</Text>
          {error ? <Text accessibilityRole="alert" style={{ color: C.red, fontSize: 13, marginTop: 14 }}>{error}</Text> : null}
        </View>

        <TouchableOpacity onPress={save} disabled={saving} activeOpacity={0.82} accessibilityRole="button" style={{ minHeight: 54, borderRadius: 18, backgroundColor: saving ? "#8DDCC8" : C.mint, alignItems: "center", justifyContent: "center", flexDirection: "row", marginTop: 22 }}>
          {saving ? <ActivityIndicator color={C.white} style={{ marginRight: 9 }} /> : <Feather name="check" size={18} color={C.white} style={{ marginRight: 9 }} />}
          <Text style={{ color: C.white, fontSize: 15, fontWeight: "800" }}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
