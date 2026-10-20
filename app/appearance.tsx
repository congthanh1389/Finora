import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { SchemeColors } from "@/constants/theme";
import { useThemeContext, type ThemeMode } from "@/lib/theme-provider";

type AppearanceOption = {
  mode: ThemeMode;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
};

const OPTIONS: AppearanceOption[] = [
  {
    mode: "system",
    icon: "smartphone",
    title: "Theo thiết bị",
    description: "Tự chuyển sáng hoặc tối theo cài đặt của điện thoại.",
  },
  {
    mode: "light",
    icon: "sun",
    title: "Sáng",
    description: "Nền mint dịu, thẻ sáng và chữ teal rõ ràng.",
  },
  {
    mode: "dark",
    icon: "moon",
    title: "Tối",
    description: "Nền xanh đậm dịu mắt khi sử dụng trong môi trường tối.",
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { colorScheme, themeMode, setThemeMode } = useThemeContext();
  const colors = SchemeColors[colorScheme];
  const accentContentColor = colorScheme === "dark" ? colors.background : colors.foreground;

  const chooseMode = async (mode: ThemeMode) => {
    if (mode === themeMode) return;
    try {
      await setThemeMode(mode);
    } catch (error) {
      Alert.alert(
        "Không thể lưu giao diện",
        error instanceof Error ? error.message : "Vui lòng thử lại.",
      );
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={8}
            style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800" }}>Giao diện</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Cá nhân hóa Finora</Text>
          </View>
          <View style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}>
            <Feather name="droplet" size={21} color={colors.primary} />
          </View>
        </View>

        <View style={{ borderRadius: 26, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 18 }}>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>Chế độ hiển thị</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 14 }}>
            Chọn cách Finora hiển thị trên thiết bị này.
          </Text>

          {OPTIONS.map((option, index) => {
            const selected = themeMode === option.mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => void chooseMode(option.mode)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${option.title}. ${option.description}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 19,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                  padding: 13,
                  marginTop: index === 0 ? 0 : 10,
                }}
              >
                <View style={{ width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: selected ? colors.primary : colors.background, marginRight: 12 }}>
                  <Feather name={option.icon} size={19} color={selected ? accentContentColor : colors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "800" }}>{option.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 }}>{option.description}</Text>
                </View>
                <View style={{ width: 23, height: 23, borderRadius: 12, borderWidth: selected ? 0 : 1.5, borderColor: colors.border, backgroundColor: selected ? colors.primary : "transparent", alignItems: "center", justifyContent: "center" }}>
                  {selected ? <Feather name="check" size={14} color={accentContentColor} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, flexDirection: "row", alignItems: "flex-start" }}>
          <Feather name="info" size={18} color={colors.primary} style={{ marginTop: 1, marginRight: 10 }} />
          <Text style={{ flex: 1, color: colors.muted, fontSize: 12, lineHeight: 19 }}>
            {themeMode === "system"
              ? `Đang theo thiết bị: giao diện ${colorScheme === "dark" ? "tối" : "sáng"}. Lựa chọn này được tự cập nhật khi chế độ của điện thoại thay đổi.`
              : `Bạn đang dùng giao diện ${themeMode === "dark" ? "tối" : "sáng"}. Lựa chọn được lưu trên thiết bị này.`}
          </Text>
        </View>

        <Text style={{ textAlign: "center", color: colors.muted, fontSize: 10, marginTop: 22 }}>
          FINORA · Tài chính rõ ràng, cuộc sống an tâm
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
