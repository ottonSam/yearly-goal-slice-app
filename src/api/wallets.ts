import { api } from "@/api/http";

export interface WalletPayload {
  name: string;
  limit: string;
  cycle_limit_default: string;
  cycle_starts: number;
  cycle_ends: number;
}

export interface ResolveWalletCyclePayload {
  wallet: string;
  date: string;
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

export interface ExpenseCycle {
  id: string;
  wallet: string;
  month: string;
  limit: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ResolveWalletCycleResponse {
  created: boolean;
  cycle: ExpenseCycle;
}

export interface WalletExpense {
  id: string;
  expense_cycle: string;
  expense_category:
    | string
    | {
        id: string;
        name: string;
        icon: string;
        color: string;
      };
  installment_serie: string | null;
  recurring_root: string | null;
  description: string;
  amount: string;
  type: string;
  date: string;
  paid?: boolean;
  installment_number?: number;
  installments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WalletExpenseCategory {
  id: string;
  user: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletExpensePayload {
  expense_cycle: string;
  expense_category: string;
  description: string;
  amount: string;
  type: "single_expense" | "recurring_expense";
  date: string;
}

export interface CreateInstallmentSeriesPayload {
  wallet: string;
  expense_category: string;
  description: string;
  total_amount: string;
  installments_count: number;
  start_date: string;
}

export interface UpdateSingleWalletExpensePayload {
  expense_category: string;
  description: string;
  amount: string;
  date: string;
}

export interface CreateWalletExpenseCategoryPayload {
  name: string;
  icon: string;
  color: string;
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

export async function resolveWalletCycle(payload: ResolveWalletCyclePayload) {
  const { data } = await api.post<ResolveWalletCycleResponse>(
    "/wallets/cycle/resolve/",
    payload,
  );
  return data;
}

export async function listWalletExpensesByCycle(expenseCycleId: string) {
  const { data } = await api.get<WalletExpense[]>("/wallets/expenses/", {
    params: { expense_cycle: expenseCycleId },
  });
  return data;
}

export async function listWalletExpenseCategories() {
  const { data } = await api.get<WalletExpenseCategory[]>("/wallets/categories/");
  return data;
}

export async function createWalletExpense(payload: CreateWalletExpensePayload) {
  const response = await api.post("/wallets/expenses/", payload);
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function createWalletExpenseCategory(
  payload: CreateWalletExpenseCategoryPayload,
) {
  const response = await api.post<WalletExpenseCategory>(
    "/wallets/categories/",
    payload,
  );
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function createInstallmentSeries(
  payload: CreateInstallmentSeriesPayload,
) {
  const response = await api.post("/wallets/installment-series/", payload);
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function updateSingleWalletExpense(
  singleExpenseId: string,
  payload: UpdateSingleWalletExpensePayload,
) {
  const response = await api.patch(`/wallets/expenses/${singleExpenseId}/`, payload);
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function cancelRecurringWalletExpense(recurringExpenseId: string) {
  const response = await api.post(
    `/wallets/expenses/${recurringExpenseId}/cancel-recurring/`,
  );
  return {
    statusCode: response.status,
    data: response.data,
  };
}
