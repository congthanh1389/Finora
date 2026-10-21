import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ReminderCard } from "@/src/modules/reminder/components/reminder-card";
import { useReportViewModel } from "@/src/modules/report/viewmodel/use-report-view-model";
import { useReminderViewModel } from "@/src/modules/reminder/viewmodel/use-reminder-view-model";
import { markNotificationsSeen, useReminderStatus } from "@/src/modules/reminder/state/reminder-state";

export default function RemindersScreen() {
  const router = useRouter();
  const { data, loading } = useReportViewModel();
  const reminders = useReminderViewModel(data);
  const { unreadIds } = useReminderStatus(reminders);

  useEffect(() => {
    markNotificationsSeen(reminders.map((reminder) => reminder.id));
  }, [reminders]);

  return (
    <ScreenContainer className="bg-[#F8FAFC] dark:bg-[#10211F]">
      <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()} className="absolute left-4 top-2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#17322D] shadow-sm">
        <Ionicons name="chevron-back" size={25} color="#0F2A5F" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 64, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-[#0F2A5F] dark:text-[#E7F5F0]">Nhắc nhở</Text>
        <Text className="mt-1 text-sm text-[#64748B] dark:text-[#A5BCB5]">
          Những điểm tài chính cần bạn chú ý trong kỳ này.
        </Text>

        {loading && !data ? (
          <View className="mt-6 rounded-3xl bg-white dark:bg-[#17322D] p-6">
            <Text className="text-center text-sm text-[#64748B] dark:text-[#A5BCB5]">Đang kiểm tra nhắc nhở...</Text>
          </View>
        ) : reminders.length === 0 ? (
          <View className="mt-6 rounded-3xl border border-[#E2E8F0] dark:border-[#31554B] bg-white dark:bg-[#17322D] p-6">
            <Text className="text-center text-base font-bold text-[#334155] dark:text-[#DCEAE5]">
              Chưa có nhắc nhở nào.
            </Text>
            <Text className="mt-2 text-center text-sm text-[#64748B] dark:text-[#A5BCB5]">
              Finora sẽ hiển thị khi có ngân sách, dòng tiền hoặc ví cần chú ý.
            </Text>
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} isUnread={unreadIds.has(reminder.id)} />
            ))}
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}
