import { Text, View } from "react-native";
import type { Reminder } from "../model/reminder.types";

const severityIcon: Record<Reminder["severity"], string> = {
  warning: "🔴",
  info: "🔵",
};

const severityClass: Record<Reminder["severity"], string> = {
  warning: "bg-[#FFF1F2]",
  info: "bg-[#F8FAFC]",
};

type ReminderCardProps = {
  reminder: Reminder;
};

export function ReminderCard({ reminder }: ReminderCardProps) {
  return (
    <View className={`rounded-2xl p-4 ${severityClass[reminder.severity]}`}>
      <View className="flex-row items-center">
        <Text className="mr-2 text-base">{severityIcon[reminder.severity]}</Text>
        <Text className="flex-1 text-sm font-bold text-[#334155]">
          {reminder.title}
        </Text>
      </View>
      <Text className="mt-1 text-xs leading-5 text-[#64748B]">
        {reminder.description}
      </Text>
    </View>
  );
}
