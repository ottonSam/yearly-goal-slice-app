import { api } from "@/api/http";

export interface WalletPayload {
  name: string;
  limit: string;
  cycle_limit_default: string;
  cycle_starts: number;
  cycle_ends: number;
}

export interface Wallet {
  id: string;
  user: string;
  name: string;
  limit: string;
  cycle_limit_default: string;
  cycle_starts: number;
  cycle_ends: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listWallets() {
  const { data } = await api.get<Wallet[]>("/wallets/");
  return data;
}

export async function getWalletById(walletId: string) {
  const { data } = await api.get<Wallet>(`/wallets/${walletId}/`);
  return data;
}

export async function createWallet(payload: WalletPayload) {
  const response = await api.post<Wallet>("/wallets/", payload);
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function updateWallet(walletId: string, payload: WalletPayload) {
  const response = await api.put<Wallet>(`/wallets/${walletId}/`, payload);
  return {
    statusCode: response.status,
    data: response.data,
  };
}
