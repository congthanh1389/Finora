import type { ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const FINORA_TURQUOISE = "#00BFA5";

export type FinoraHeaderBannerProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: keyof typeof Feather.glyphMap;
  badgeText?: string;
  onBack?: () => void;
  footer?: ReactNode;
};

export function FinoraHeaderBanner({
  eyebrow,
  title,
  subtitle,
  icon = "info",
  badgeText,
  onBack,
  footer,
}: FinoraHeaderBannerProps) {
  return (
    <View
      style={{
        backgroundColor: FINORA_TURQUOISE,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 18,
        marginBottom: 18,
        overflow: "hidden",
      }}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.20)",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>‹  Quay lại</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ color: "#E8FFFA", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 6 }}>
            {eyebrow}
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 23, lineHeight: 28, fontWeight: "800" }}>
            {title}
          </Text>
          <Text style={{ color: "#F0FFFC", fontSize: 12, lineHeight: 17, marginTop: 6 }}>
            {subtitle}
          </Text>
        </View>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.22)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.35)",
          }}
        >
          {badgeText ? (
            <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "800" }}>{badgeText}</Text>
          ) : (
            <Feather name={icon} size={22} color="#FFFFFF" />
          )}
        </View>
      </View>
      {footer}
    </View>
  );
}
