import { Platform } from "react-native";

import { initializeDeviceStorage } from "../storage/device-store";

export type DeviceRuntimeInfo = {
  platform: string;
  androidVersion: number | null;
  storageReady: boolean;
  localFirst: true;
};

export async function initializeDeviceRuntime(): Promise<DeviceRuntimeInfo> {
  const androidVersion =
    Platform.OS === "android" && typeof Platform.Version === "number"
      ? Platform.Version
      : null;

  if (androidVersion !== null && androidVersion < 24) {
    throw new Error("Finora requires Android 7.0 (API 24) or newer.");
  }

  await initializeDeviceStorage();

  return {
    platform: Platform.OS,
    androidVersion,
    storageReady: true,
    localFirst: true,
  };
}
