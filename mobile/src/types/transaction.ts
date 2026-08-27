export type TransactionType = "add" | "subtract";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  owner: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  balanceAfter: number;
}

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  owner: string;
}
