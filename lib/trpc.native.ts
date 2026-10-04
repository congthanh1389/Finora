import { Platform } from "react-native";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient(): null {
  if (Platform.OS === "web") {
    return null;
  }
  return null;
}
