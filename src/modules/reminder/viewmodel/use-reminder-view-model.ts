import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import * as Auth from "@/lib/_core/auth";
import { getFinancialPreferences } from "@/src/core/settings/financial-preferences";
import type { ReportSnapshot } from "@/src/modules/report/model/report.types";
import type { Reminder } from "../model/reminder.types";
import { ReminderService } from "../service/reminder.service";

const reminderService = new ReminderService();
const reminderFirstSeenAt = new Map<string, number>();

let orderedReminders: Reminder[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Reminder[] {
  return orderedReminders;
}

function publish(reminders: Reminder[]): void {
  orderedReminders = reminders;
  for (const listener of listeners) {
    listener();
  }
}

export function useReminderViewModel(snapshot: ReportSnapshot | null): Reminder[] {
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);

  useEffect(() => {
    let active = true;
    void Auth.getUserInfo().then(async (user) => {
      if (!user) return;
      const preferences = await getFinancialPreferences(user.id);
      if (!active) return;
      setBudgetAlertsEnabled(preferences.budgetAlertsEnabled);
      setBudgetAlertThreshold(preferences.budgetAlertThreshold);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const reminders = useMemo(
    () => (snapshot ? reminderService.getReminders(snapshot, { budgetAlertsEnabled, budgetAlertThreshold }) : []),
    [snapshot, budgetAlertsEnabled, budgetAlertThreshold],
  );

  const currentReminders = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    const now = Date.now();

    for (const reminder of reminders) {
      if (!reminderFirstSeenAt.has(reminder.id)) {
        reminderFirstSeenAt.set(reminder.id, now);
      }
    }

    const next = [...reminders].sort(
      (a, b) =>
        (reminderFirstSeenAt.get(b.id) ?? 0) - (reminderFirstSeenAt.get(a.id) ?? 0) ||
        b.priority - a.priority,
    );

    const changed =
      next.length !== orderedReminders.length ||
      next.some((reminder, index) => reminder.id !== orderedReminders[index]?.id);

    if (changed) {
      publish(next);
    }
  }, [reminders]);

  return currentReminders;
}
