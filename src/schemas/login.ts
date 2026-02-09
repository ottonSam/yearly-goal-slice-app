import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário."),
  password: z.string().min(1, "Informe a senha."),
})

export type LoginFormValues = z.infer<typeof loginSchema>
