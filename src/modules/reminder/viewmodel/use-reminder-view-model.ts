import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";
import type { Reminder } from "../model/reminder.types";
import { ReminderService } from "../service/reminder.service";

const reminderService = new ReminderService();
const REMINDER_ORDER_KEY = "finora.reminders.order.v1";

type ReminderOrder = Record<string, number>;

export function useReminderViewModel(snapshot: ReportSnapshot | null) {
  const reminders = useMemo(
    () => (snapshot ? reminderService.getReminders(snapshot) : []),
    [snapshot],
  );
  const [orderedReminders, setOrderedReminders] = useState<Reminder[]>(reminders);

  useEffect(() => {
    let cancelled = false;

    if (!snapshot) {
      setOrderedReminders([]);
      return () => {
        cancelled = true;
      };
    }

    const syncOrder = async () => {
      let order: ReminderOrder = {};
      try {
        const stored = await AsyncStorage.getItem(REMINDER_ORDER_KEY);
        if (stored) order = JSON.parse(stored) as ReminderOrder;
      } catch {
        order = {};
      }

      let changed = false;
      const now = Date.now();
      for (const reminder of reminders) {
        if (order[reminder.id] == null) {
          order[reminder.id] = now;
          changed = true;
        }
      }

      if (changed) {
        try {
          await AsyncStorage.setItem(REMINDER_ORDER_KEY, JSON.stringify(order));
        } catch {
          // Keep the current in-memory order when storage is unavailable.
        }
      }

      if (cancelled) return;

      setOrderedReminders(
        [...reminders].sort(
          (a, b) => (order[b.id] ?? 0) - (order[a.id] ?? 0) || b.priority - a.priority,
        ),
      );
    };

    void syncOrder();

    return () => {
      cancelled = true;
    };
  }, [reminders, snapshot]);

  return orderedReminders;
}
