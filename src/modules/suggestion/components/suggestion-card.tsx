import { Text, View } from "react-native";
import type { Suggestion } from "../model/suggestion.types";

const severityIcon: Record<Suggestion["severity"], string> = {
  warning: "🔴",
  info: "🔵",
  positive: "🟢",
};

const severityClass: Record<Suggestion["severity"], string> = {
  warning: "bg-[#FFF1F2]",
  info: "bg-[#F8FAFC]",
  positive: "bg-[#ECFDF5]",
};

type SuggestionCardProps = {
  suggestion: Suggestion;
};

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <View className={`mt-3 rounded-2xl p-4 ${severityClass[suggestion.severity]}`}>
      <View className="flex-row items-center">
        <Text className="mr-2 text-base">{severityIcon[suggestion.severity]}</Text>
        <Text className="flex-1 text-sm font-bold text-[#334155]">
          {suggestion.title}
        </Text>
      </View>
      <Text className="mt-1 text-xs leading-5 text-[#64748B]">
        {suggestion.description}
      </Text>
    </View>
  );
}
