import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/ControlledInput";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/schemas/verify-email";
import { useAuth } from "@/contexts/auth";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/assets/utils/getApiErrorMessage";
import React from "react";

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "success",
  );
  const [dialogMessage, setDialogMessage] = React.useState("");
  const formMethods = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const onSubmit = async (data: VerifyEmailFormValues) => {
    try {
      await verifyEmail(data);
      setDialogStatus("success");
      setDialogMessage(
        "Email verificado com sucesso. Faça login para continuar.",
      );
      setDialogOpen(true);
    } catch (error) {
      setDialogStatus("error");
      setDialogMessage(getApiErrorMessage(error));
      setDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Verificação
          </p>
          <h1 className="font-display text-4xl font-semibold">
            Verifique seu email
          </h1>
          <p className="text-sm text-muted-foreground">
            Informe o email e o código de 6 dígitos enviado para você.
          </p>
        </header>

        <FormProvider {...formMethods}>
          <form
            className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
            onSubmit={formMethods.handleSubmit(onSubmit)}
          >
            <ControlledInput
              name="email"
              label="Email"
              type="email"
              placeholder="exampleuser@email.com"
              autoComplete="email"
            />

            <ControlledInput
              name="code"
              label="Código"
              placeholder="000000"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
            />

            <div className="flex items-center justify-end">
              <Button type="submit">Verificar</Button>
            </div>
          </form>
        </FormProvider>
      </div>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={<button className="hidden" type="button" aria-hidden="true" />}
        title={
          dialogStatus === "success"
            ? "Verificação concluída"
            : "Não foi possível verificar"
        }
        description={
          dialogStatus === "success"
            ? "Continue para o login."
            : "Tente novamente mais tarde."
        }
        footer={
          dialogStatus === "success" ? (
            <Button
              onClick={() => {
                setDialogOpen(false);
                navigate("/login");
              }}
            >
              Ir para login
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
          )
        }
      >
        <p className="text-sm text-muted-foreground">{dialogMessage}</p>
      </ResponsiveDialog>
    </div>
  );
}
