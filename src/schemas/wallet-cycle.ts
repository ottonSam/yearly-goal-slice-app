import { z } from "zod";

export const expenseCategorySummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
  })
  .passthrough();

export const expenseCycleSchema = z
  .object({
    id: z.string(),
    wallet: z.string(),
    month: z.string(),
    limit: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();

export const resolveWalletCycleResponseSchema = z
  .object({
    created: z.boolean(),
    cycle: expenseCycleSchema,
  })
  .passthrough();

export const walletExpenseSchema = z
  .object({
    id: z.string(),
    expense_cycle: z.string(),
    expense_category: z.union([z.string(), expenseCategorySummarySchema]),
    installment_serie: z.string().nullable(),
    recurring_root: z.string().nullable(),
    description: z.string(),
    amount: z.string(),
    type: z.string(),
    date: z.string(),
    paid: z.boolean().optional(),
    installment_number: z.number().optional(),
    installments_count: z.number().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();

export const walletExpenseListSchema = z.array(walletExpenseSchema);
export type WalletExpense = z.infer<typeof walletExpenseSchema>;

export const walletCycleBillingCategorySchema = z
  .object({
    category_id: z.string(),
    category_name: z.string(),
    category_icon: z.string(),
    category_color: z.string(),
    total_spent: z.string(),
  })
  .passthrough();

export const walletCycleBillingSummarySchema = z
  .object({
    total_cycle_spent: z.string(),
    spending_by_category: z.array(walletCycleBillingCategorySchema),
    total_cycle_installment_spent: z.string(),
    total_cycle_recurring_spent: z.string(),
    total_future_installment_spent: z.string(),
    remaining_limit_per_day: z.string().nullable().optional(),
  })
  .passthrough();

export type WalletCycleBillingSummary = z.infer<
  typeof walletCycleBillingSummarySchema
>;
