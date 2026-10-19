import type { ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const FINORA_TURQUOISE = "#00D4B3";

export type FinoraHeaderBannerProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: keyof typeof Feather.glyphMap;
  badgeText?: string;
  onBack?: () => void;
  footer?: ReactNode;
  titleSize?: number;
};

export function FinoraHeaderBanner({
  eyebrow,
  title,
  subtitle,
  icon = "info",
  badgeText,
  onBack,
  footer,
  titleSize = 23,
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
            backgroundColor: "rgba(255,255,255,0.84)",
          }}
        >
          <Text style={{ color: "#075E55", fontSize: 13, fontWeight: "800" }}>‹  Quay lại</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ color: "#075E55", fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 6 }}>
            {eyebrow}
          </Text>
          <Text style={{ color: "#075E55", fontSize: titleSize, lineHeight: titleSize + 5, fontWeight: "900", letterSpacing: -0.3 }}>
            {title}
          </Text>
          <Text style={{ color: "#075E55", fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 6 }}>
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
            backgroundColor: "rgba(255,255,255,0.86)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.95)",
          }}
        >
          {badgeText ? (
            <Text style={{ color: "#075E55", fontSize: 24, fontWeight: "900" }}>{badgeText}</Text>
          ) : (
            <Feather name={icon} size={22} color="#075E55" />
          )}
        </View>
      </View>
      {footer}
    </View>
  );
}
