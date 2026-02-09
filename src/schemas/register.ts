import { z } from "zod"

export const registerSchema = z
  .object({
    username: z.string().min(3, "Informe ao menos 3 caracteres."),
    email: z.string().email("Email inválido."),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter letra minúscula.")
      .regex(/\d/, "A senha deve conter um número.")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter um caractere especial."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
    first_name: z.string().min(1, "Informe o nome."),
    last_name: z.string().min(1, "Informe o sobrenome."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
