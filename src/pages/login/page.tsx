import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { ControlledInput } from "@/components/form/ControlledInput"
import { loginSchema, type LoginFormValues } from "@/schemas/login"
import { useAuth } from "@/contexts/auth"
import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import { getApiErrorMessage } from "@/assets/utils/getApiErrorMessage"
import errorGator from "@/assets/img/errorgator.png"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMessage, setDialogMessage] = React.useState("")
  const formMethods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data)
      navigate("/")
    } catch (error) {
      setDialogMessage(getApiErrorMessage(error))
      setDialogOpen(true)
    }
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
            <div className="text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Criar conta
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Precisa confirmar o email?{" "}
              <Link to="/verify-email" className="text-primary hover:underline">
                Verificar email
              </Link>
            </div>
          </form>
        </FormProvider>
      </div>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={<button className="hidden" type="button" aria-hidden="true" />}
        title="Não foi possível entrar"
        description="Verifique suas credenciais e tente novamente."
        footer={
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Fechar
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src={errorGator}
            alt="Erro"
            className="h-28 w-28 object-contain"
          />
          <p className="text-center text-sm text-muted-foreground">
            {dialogMessage}
          </p>
        </div>
      </ResponsiveDialog>
    </div>
  )
}
