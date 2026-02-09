import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { ControlledInput } from "@/components/form/ControlledInput"
import { loginSchema, type LoginFormValues } from "@/schemas/login"

export default function LoginPage() {
  const formMethods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login payload:", data)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Acesso
          </p>
          <h1 className="font-display text-4xl font-semibold">Entrar</h1>
          <p className="text-sm text-muted-foreground">
            Informe suas credenciais para continuar.
          </p>
        </header>

        <FormProvider {...formMethods}>
          <form
            className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
            onSubmit={formMethods.handleSubmit(onSubmit)}
          >
            <ControlledInput
              name="username"
              label="Usuário"
              placeholder="exampleuser"
              autoComplete="username"
            />

            <ControlledInput
              name="password"
              label="Senha"
              type="password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end">
              <Button type="submit">Entrar</Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
