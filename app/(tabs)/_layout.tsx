import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { FinoraMockupIcon } from "@/components/ui/finora-mockup-icons";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          paddingTop: 7,
          paddingBottom: bottomPadding,
          height: 62 + bottomPadding,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EEF2F7",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Tổng quan", tabBarIcon: () => <FinoraMockupIcon name="nav_home" size={23} /> }} />
      <Tabs.Screen name="reports" options={{ title: "Báo cáo", tabBarIcon: () => <FinoraMockupIcon name="nav_report" size={23} /> }} />
      <Tabs.Screen name="wallet" options={{ title: "Ví", tabBarIcon: () => <FinoraMockupIcon name="nav_wallet" size={23} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Cài đặt", tabBarIcon: () => <FinoraMockupIcon name="nav_settings" size={23} /> }} />
    </Tabs>
  );
}
