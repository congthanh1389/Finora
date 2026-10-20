import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type FinoraProfilePageHeaderProps = {
  title: string;
  onBack: () => void;
  onSettings: () => void;
};

export function FinoraProfilePageHeader({ title, onBack, onSettings }: FinoraProfilePageHeaderProps) {
  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 17 }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="arrow-left" size={24} color="#08665D" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ flex: 1, textAlign: "center", color: "#164F4B", fontSize: 24, fontWeight: "800", marginHorizontal: 6 }}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={onSettings}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Cài đặt"
          style={{ width: 42, height: 42, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="settings" size={22} color="#08665D" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 23, position: "relative" }}>
        <Text style={{ color: "#37A991", fontSize: 19, fontStyle: "italic", fontWeight: "400", lineHeight: 29, letterSpacing: 0.25 }}>
          Quản lý tài chính{"\n"}Tận hưởng cuộc sống ♡
        </Text>
        <View style={{ position: "absolute", right: 12, top: 2, width: 88, height: 88, borderRadius: 44, backgroundColor: "#D7F6EC", opacity: 0.8 }} />
      </View>
    </>
  );
}
