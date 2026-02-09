import { z } from "zod"

export const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido."),
  code: z
    .string()
    .regex(/^\d{6}$/, "Informe um código numérico de 6 dígitos."),
})

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>
