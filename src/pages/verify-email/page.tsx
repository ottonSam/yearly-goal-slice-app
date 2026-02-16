import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/ControlledInput";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/schemas/verify-email";
import { useAuth } from "@/contexts/use-auth";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import React from "react";

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "success",
  );
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });
  const formMethods = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const onSubmit = async (data: VerifyEmailFormValues) => {
    try {
      const statusCode = await verifyEmail(data);
      setDialogStatus("success");
      setDialogResult({
        statusCode,
        body: "Email verificado com sucesso. Faça login para continuar.",
      });
      setDialogOpen(true);
    } catch (error) {
      setDialogStatus("error");
      setDialogResult(getApiErrorMessage(error));
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

      <HttpRequestResultDialog
        title={
          dialogStatus === "success"
            ? "Verificação concluída"
            : "Não foi possível verificar"
        }
        isOpen={dialogOpen}
        isSuccess={dialogStatus === "success"}
        statusCode={dialogResult.statusCode}
        message={dialogResult.body}
        closeAction={() => setDialogOpen(false)}
        buttonTitle={dialogStatus === "success" ? "Ir para login" : "Fechar"}
        buttonAction={() => {
          setDialogOpen(false);
          if (dialogStatus === "success") {
            navigate("/login");
          }
        }}
      />
    </div>
  );
}
