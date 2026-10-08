import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";
import type { Reminder } from "../model/reminder.types";

const STORAGE_KEY = "@finora/reminder-state-v1";

type PersistedState = {
  readIds: string[];
  notificationSeenIds: string[];
};

type ReminderStateSnapshot = {
  hydrated: boolean;
  readIds: string[];
  notificationSeenIds: string[];
};

const listeners = new Set<() => void>();

let snapshot: ReminderStateSnapshot = {
  hydrated: false,
  readIds: [],
  notificationSeenIds: [],
};

let hydratePromise: Promise<void> | null = null;

function emit(next: ReminderStateSnapshot): void {
  snapshot = next;
  for (const listener of listeners) {
    listener();
  }
}

async function persist(): Promise<void> {
  const state: PersistedState = {
    readIds: snapshot.readIds,
    notificationSeenIds: snapshot.notificationSeenIds,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function hydrateReminderState(): Promise<void> {
  if (hydratePromise) return hydratePromise;

  hydratePromise = AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) {
        emit({ ...snapshot, hydrated: true });
        return;
      }

      try {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        emit({
          hydrated: true,
          readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
          notificationSeenIds: Array.isArray(parsed.notificationSeenIds)
            ? parsed.notificationSeenIds
            : [],
        });
      } catch {
        emit({ ...snapshot, hydrated: true });
      }
    })
    .catch(() => {
      emit({ ...snapshot, hydrated: true });
    });

  return hydratePromise;
}

export function registerReminders(reminders: Reminder[]): void {
  if (reminders.length === 0) return;

  const known = new Set(snapshot.notificationSeenIds);
  const changed = reminders.some((reminder) => !known.has(reminder.id));

  if (!changed) return;

  // New reminders stay unseen until the user opens the reminder screen.
  // They are intentionally not added to notificationSeenIds here.
}

export function markNotificationsSeen(ids: string[]): void {
  if (ids.length === 0) return;

  const current = new Set(snapshot.notificationSeenIds);
  let changed = false;

  for (const id of ids) {
    if (!current.has(id)) {
      current.add(id);
      changed = true;
    }
  }

  if (!changed) return;

  const next = { ...snapshot, notificationSeenIds: [...current] };
  emit(next);
  void persist();
}

export function markReminderRead(id: string): void {
  if (snapshot.readIds.includes(id)) return;

  const next = {
    ...snapshot,
    readIds: [...snapshot.readIds, id],
  };
  emit(next);
  void persist();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ReminderStateSnapshot {
  return snapshot;
}

export function useReminderStatus(reminders: Reminder[]): {
  newCount: number;
  unreadIds: Set<string>;
  hydrated: boolean;
} {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void hydrateReminderState();
    registerReminders(reminders);
  }, [reminders]);

  return {
    newCount: reminders.filter((reminder) => !current.notificationSeenIds.includes(reminder.id)).length,
    unreadIds: new Set(current.readIds.length ? reminders.filter((reminder) => !current.readIds.includes(reminder.id)).map((reminder) => reminder.id) : reminders.map((reminder) => reminder.id)),
    hydrated: current.hydrated,
  };
}
