import {
  useForm,
  FormProvider,
  type SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/ControlledInput";
import { registerSchema, type RegisterFormValues } from "@/schemas/register";

export default function RegisterPage() {
  const formMethods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log("Register payload:", data);
  };

  const onInvalid: SubmitErrorHandler<RegisterFormValues> = (errors) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      formMethods.setFocus(firstField as keyof RegisterFormValues);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Cadastro
          </p>
          <h1 className="font-display text-4xl font-semibold">
            Crie sua conta
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo para começar.
          </p>
        </header>

        <FormProvider {...formMethods}>
          <form
            className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
            onSubmit={formMethods.handleSubmit(onSubmit, onInvalid)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ControlledInput
                name="first_name"
                label="Nome"
                placeholder="Ex: Maria"
              />
              <ControlledInput
                name="last_name"
                label="Sobrenome"
                placeholder="Ex: Silva"
              />
            </div>

            <ControlledInput
              name="username"
              label="Usuário"
              placeholder="Ex: exampleuser"
              autoComplete="username"
            />

            <ControlledInput
              name="email"
              label="Email"
              type="email"
              placeholder="exampleuser@email.com"
              autoComplete="email"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <ControlledInput
                name="password"
                label="Senha"
                type="password"
                autoComplete="new-password"
              />
              <ControlledInput
                name="confirmPassword"
                label="Confirmar senha"
                type="password"
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com os termos de uso.
              </p>
              <Button type="submit">Criar conta</Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
