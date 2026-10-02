import type { Wallet } from "../../../../drizzle/schema";

export type WalletType = Wallet["type"];
export type WalletCurrency = Wallet["currency"];

export type CreateWalletInput = {
  userId: number;
  name: string;
  type: WalletType;
  currency?: string;
  openingBalance?: number;
  allowNegative?: boolean;
};

export type WalletSummary = {
  id: number;
  name: string;
  type: WalletType;
  currency: string;
  openingBalance: number;
  allowNegative: boolean;
  isArchived: boolean;
};