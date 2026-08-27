import axios from "axios";
import { Transaction, TransactionPayload } from "../types/transaction";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not configured.");
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const api = {
  getBalance: async (): Promise<number> => {
    const response = await client.get("/balance");
    return response.data.balance;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await client.get("/transactions");
    return response.data;
  },

  createTransaction: async (payload: TransactionPayload): Promise<Transaction> => {
    const response = await client.post("/transactions", payload);
    return response.data;
  },

  updateTransaction: async (
    id: string,
    payload: TransactionPayload
  ): Promise<Transaction> => {
    const response = await client.put(`/transactions/${id}`, payload);
    return response.data;
  },

  deleteTransaction : async (transactionId: string) => {
    const response = await client.delete(`/transactions/${transactionId}`);
    return response.data;
  },

  getDeletedTransactions : async () => {
    const response = await client.get(
      "/transactions/deleted"
    );

    return response.data;
  }
};
