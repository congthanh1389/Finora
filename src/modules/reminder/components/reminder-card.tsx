import { Text, TouchableOpacity } from "react-native";
import type { Reminder } from "../model/reminder.types";
import { markReminderRead } from "../state/reminder-state";

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
  isUnread: boolean;
};

export function ReminderCard({ reminder, isUnread }: ReminderCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => markReminderRead(reminder.id)}
      className={`rounded-2xl p-4 ${severityClass[reminder.severity]}`}
    >
      <Text className={`mr-2 text-base ${isUnread ? "font-bold" : "font-normal"} text-[#334155]`}>
        {severityIcon[reminder.severity]}{" "}
        <Text className={isUnread ? "font-bold" : "font-normal"}>{reminder.title}</Text>
      </Text>
      <Text className="mt-1 text-xs leading-5 text-[#64748B]">
        {reminder.description}
      </Text>
    </TouchableOpacity>
  );
}
