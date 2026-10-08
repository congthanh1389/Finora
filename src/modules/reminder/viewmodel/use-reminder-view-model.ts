import { useMemo } from "react";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";
import type { Reminder } from "../model/reminder.types";
import { ReminderService } from "../service/reminder.service";

const reminderService = new ReminderService();
const reminderFirstSeenAt = new Map<string, number>();

export function useReminderViewModel(snapshot: ReportSnapshot | null): Reminder[] {
  return useMemo(() => {
    if (!snapshot) return [];

    const reminders = reminderService.getReminders(snapshot);
    const now = Date.now();

    for (const reminder of reminders) {
      if (!reminderFirstSeenAt.has(reminder.id)) {
        reminderFirstSeenAt.set(reminder.id, now);
      }
    }

    return [...reminders].sort(
      (a, b) =>
        (reminderFirstSeenAt.get(b.id) ?? 0) - (reminderFirstSeenAt.get(a.id) ?? 0) ||
        b.priority - a.priority,
    );
  }, [snapshot]);
}
