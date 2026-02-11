import { z } from "zod"

export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "Informe o nome."),
  last_name: z.string().min(1, "Informe o sobrenome."),
})

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Informe sua senha atual."),
    new_password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter letra minúscula.")
      .regex(/\d/, "A senha deve conter um número.")
      .regex(/[^A-Za-z0-9]/, "A senha deve conter um caractere especial."),
    confirm_new_password: z.string().min(1, "Confirme sua nova senha."),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "As senhas não conferem.",
    path: ["confirm_new_password"],
  })

export const userProfileSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    username: z.string().optional(),
    email: z.string().email("Email inválido.").optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .passthrough()

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
