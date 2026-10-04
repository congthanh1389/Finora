import type { PropsWithChildren } from "react";

type NativeTrpcProviderProps = PropsWithChildren<{
  client?: unknown;
  queryClient?: unknown;
}>;

function NativeTrpcProvider({ children }: NativeTrpcProviderProps) {
  return children;
}

export const trpc = {
  Provider: NativeTrpcProvider,
};

export function createTRPCClient(): null {
  return null;
}
