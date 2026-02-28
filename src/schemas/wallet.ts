import { z } from "zod";

const moneyRegex = /^\d+(\.\d{1,2})?$/;

export const walletSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    name: z.string(),
    limit: z.string(),
    cycle_limit_default: z.string(),
    cycle_starts: z.number(),
    cycle_ends: z.number(),
    active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();

export const walletListSchema = z.array(walletSchema);
export const walletResponseSchema = walletSchema;

export const walletFormSchema = z.object({
  name: z.string().min(1, "Informe o nome da carteira."),
  limit: z
    .string()
    .regex(moneyRegex, "Informe um valor válido (ex.: 5000.00)."),
  cycle_limit_default: z
    .string()
    .regex(moneyRegex, "Informe um valor válido (ex.: 3000.00)."),
  cycle_starts: z.coerce
    .number()
    .int("Informe um dia inteiro.")
    .min(1, "Informe um dia entre 1 e 31.")
    .max(31, "Informe um dia entre 1 e 31."),
  cycle_ends: z.coerce
    .number()
    .int("Informe um dia inteiro.")
    .min(1, "Informe um dia entre 1 e 31.")
    .max(31, "Informe um dia entre 1 e 31."),
});

export type WalletFormValues = z.infer<typeof walletFormSchema>;
