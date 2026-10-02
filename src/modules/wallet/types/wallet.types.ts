export type WalletType = "cash" | "bank" | "e_wallet" | "credit_card" | "other";

export type Wallet = {
  id: number;
  userId: number;
  name: string;
  type: WalletType;
  currency: string;
  openingBalance: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WalletBalance = {
  walletId: number;
  currency: string;
  openingBalance: string;
  transactionEffect: string;
  currentBalance: string;
};
