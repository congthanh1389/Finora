import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, PanResponder, Pressable, ScrollView, Text, View } from "react-native";
import { useCallback, useMemo, useState } from "react";

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

type BrightnessSliderProps = {
  value: number;
  onChange: (value: number) => void;
  trackColor: string;
  activeColor: string;
  thumbColor: string;
};

function BrightnessSlider({ value, onChange, trackColor, activeColor, thumbColor }: BrightnessSliderProps) {
  const [trackWidth, setTrackWidth] = useState(1);
  const updateFromX = (x: number) => {
    const fraction = Math.max(0, Math.min(1, x / trackWidth));
    onChange(Math.round((fraction * 100) / 5) * 5);
  };
  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => updateFromX(event.nativeEvent.locationX),
      onPanResponderMove: (event) => updateFromX(event.nativeEvent.locationX),
    }),
    [trackWidth, onChange],
  );

  return (
    <View
      onLayout={(event) => setTrackWidth(Math.max(1, event.nativeEvent.layout.width))}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Độ sáng giao diện"
      style={{ height: 36, justifyContent: "center" }}
    >
      <View style={{ height: 7, borderRadius: 5, backgroundColor: trackColor, justifyContent: "center" }}>
        <View style={{ width: `${value}%`, height: 7, borderRadius: 5, backgroundColor: activeColor }} />
        <View style={{ position: "absolute", left: `${value}%`, marginLeft: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: thumbColor, borderWidth: 2, borderColor: activeColor, elevation: 2 }} />
      </View>
    </View>
  );
}

export default function AppearanceScreen() {
  const router = useRouter();
  const { colorScheme, themeMode, setThemeMode, brightness, setBrightness, surfaceColor } = useThemeContext();
  const colors = SchemeColors[colorScheme];
  const accentContentColor = colorScheme === "dark" ? colors.background : colors.foreground;

  const chooseBrightness = useCallback(async (value: number) => {
    try {
      await setBrightness(value);
    } catch (error) {
      Alert.alert(
        "Không thể lưu độ sáng",
        error instanceof Error ? error.message : "Vui lòng thử lại.",
      );
    }
  }, [setBrightness]);

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

        <View style={{ borderRadius: 26, borderWidth: 1, borderColor: colors.border, backgroundColor: surfaceColor, padding: 18 }}>
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

          <View style={{ marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }}>Độ sáng giao diện</Text>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "800" }}>{brightness}%</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>
              Tinh chỉnh độ sáng nền và thẻ trong Finora. Không thay đổi độ sáng màn hình điện thoại.
            </Text>
            <BrightnessSlider
              value={brightness}
              onChange={chooseBrightness}
              trackColor={colors.border}
              activeColor={colors.primary}
              thumbColor={colors.surface}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>Tối hơn</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>Mặc định</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>Sáng hơn</Text>
            </View>
            <View style={{ marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: surfaceColor, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>XEM TRƯỚC</Text>
              <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 8 }}>Tổng số dư</Text>
              <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", marginTop: 2 }}>25.680.000 ₫</Text>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700", marginTop: 6 }}>Giao diện Finora</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: surfaceColor, padding: 16, flexDirection: "row", alignItems: "flex-start" }}>
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
