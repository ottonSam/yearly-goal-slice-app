import { z } from "zod";

const moneyRegex = /^\d+(\.\d{1,2})?$/;

export const walletExpenseTypeSchema = z.enum([
  "single_expense",
  "recurring_expense",
  "installment_expense",
]);

export const walletExpenseCategorySchema = z
  .object({
    id: z.string(),
    user: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();

export const walletExpenseCategoryListSchema = z.array(walletExpenseCategorySchema);

export const walletExpenseFormSchema = z
  .object({
    expense_type: walletExpenseTypeSchema,
    expense_category: z.string().min(1, "Informe a categoria da despesa."),
    description: z.string().min(1, "Informe a descrição."),
    amount: z.string().optional(),
    date: z.string().optional(),
    total_amount: z.string().optional(),
    installments_count: z.coerce.number().optional(),
    start_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.expense_type === "installment_expense") {
      if (!data.total_amount || !moneyRegex.test(data.total_amount)) {
        ctx.addIssue({
          code: "custom",
          path: ["total_amount"],
          message: "Informe um valor válido (ex.: 2400.00).",
        });
      }

      if (
        !data.installments_count ||
        !Number.isInteger(data.installments_count) ||
        data.installments_count < 1
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["installments_count"],
          message: "Informe um número inteiro maior que 0.",
        });
      }

      if (!data.start_date) {
        ctx.addIssue({
          code: "custom",
          path: ["start_date"],
          message: "Informe a data de início.",
        });
      }

      return;
    }

    if (!data.amount || !moneyRegex.test(data.amount)) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Informe um valor válido (ex.: 150.00).",
      });
    }

    if (!data.date) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Informe a data da despesa.",
      });
    }
  });

export const walletExpenseCategoryFormSchema = z.object({
  name: z.string().min(1, "Informe o nome da categoria."),
  icon: z.string().min(1, "Selecione um ícone."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Selecione uma cor válida."),
});

export const walletSingleExpenseEditFormSchema = z.object({
  expense_category: z.string().min(1, "Selecione uma categoria."),
  description: z.string().min(1, "Informe a descrição."),
  amount: z
    .string()
    .regex(moneyRegex, "Informe um valor válido (ex.: 150.00)."),
  date: z.string().min(1, "Informe a data da despesa."),
});

export type WalletExpenseFormValues = z.infer<typeof walletExpenseFormSchema>;
export type WalletExpenseType = z.infer<typeof walletExpenseTypeSchema>;
export type WalletExpenseCategoryFormValues = z.infer<
  typeof walletExpenseCategoryFormSchema
>;
export type WalletSingleExpenseEditFormValues = z.infer<
  typeof walletSingleExpenseEditFormSchema
>;
