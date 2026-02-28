import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FormProvider,
  useForm,
  type SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import {
  createWallet,
  getWalletById,
  updateWallet,
} from "@/api/wallets";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { normalizeMoneyInput } from "@/assets/utils/money";
import { ControlledInput } from "@/components/form/ControlledInput";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/use-auth";
import { userScopedKey } from "@/lib/query-keys";
import {
  walletFormSchema,
  walletResponseSchema,
  type WalletFormValues,
} from "@/schemas/wallet";

export default function WalletFormPage() {
  const navigate = useNavigate();
  const { walletId } = useParams<{ walletId: string }>();
  const isEditMode = Boolean(walletId);
  const { user } = useAuth();
  const userId = user?.id;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "error",
  );
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const formMethods = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      limit: "",
      cycle_limit_default: "",
      cycle_starts: 1,
      cycle_ends: 1,
    },
  });

  const {
    data: walletData,
    isLoading: isLoadingWallet,
    error: walletError,
  } = useQuery({
    queryKey: userScopedKey(userId, "wallets", "detail", walletId ?? "unknown"),
    enabled: isEditMode && Boolean(walletId),
    queryFn: async () => {
      const data = await getWalletById(walletId!);
      const parsed = walletResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  React.useEffect(() => {
    if (!walletData) {
      return;
    }

    formMethods.reset({
      name: walletData.name,
      limit: walletData.limit,
      cycle_limit_default: walletData.cycle_limit_default,
      cycle_starts: walletData.cycle_starts,
      cycle_ends: walletData.cycle_ends,
    });
  }, [formMethods, walletData]);

  React.useEffect(() => {
    if (!walletError) {
      return;
    }

    const apiResult =
      walletError instanceof Error && walletError.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: walletError.message }
        : getApiErrorMessage(walletError);

    setDialogStatus("error");
    setDialogTitle("Não foi possível carregar a carteira");
    setDialogResult(apiResult);
    setDialogOpen(true);
  }, [walletError]);

  const onSubmit = async (values: WalletFormValues) => {
    try {
      const payload = {
        name: values.name,
        limit: normalizeMoneyInput(values.limit),
        cycle_limit_default: normalizeMoneyInput(values.cycle_limit_default),
        cycle_starts: values.cycle_starts,
        cycle_ends: values.cycle_ends,
      };

      const response =
        isEditMode && walletId
          ? await updateWallet(walletId, payload)
          : await createWallet(payload);

      setDialogStatus("success");
      setDialogTitle(isEditMode ? "Carteira atualizada" : "Carteira criada");
      setDialogResult({
        statusCode: response.statusCode,
        body: isEditMode
          ? "A carteira foi atualizada com sucesso."
          : "A carteira foi criada com sucesso.",
      });
      setDialogOpen(true);
    } catch (error) {
      setDialogStatus("error");
      setDialogTitle(
        isEditMode
          ? "Não foi possível atualizar a carteira"
          : "Não foi possível criar a carteira",
      );
      setDialogResult(getApiErrorMessage(error));
      setDialogOpen(true);
    }
  };

  const onInvalid: SubmitErrorHandler<WalletFormValues> = (errors) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      formMethods.setFocus(firstField as keyof WalletFormValues);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogStatus === "success") {
      navigate("/wallets");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">
          {isEditMode ? "Editar carteira" : "Criar carteira"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Atualize os dados da carteira selecionada."
            : "Preencha os dados para criar uma nova carteira."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dados da carteira</CardTitle>
          <CardDescription>
            Defina nome, limites e período do ciclo da carteira.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode && isLoadingWallet ? (
            <p className="text-sm text-muted-foreground">
              Carregando carteira...
            </p>
          ) : (
            <FormProvider {...formMethods}>
              <form
                className="space-y-4"
                onSubmit={formMethods.handleSubmit(onSubmit, onInvalid)}
              >
                <ControlledInput
                  name="name"
                  label="Nome"
                  placeholder="Wallet Principal"
                  disabled={formMethods.formState.isSubmitting}
                />

                <ControlledInput
                  name="limit"
                  label="Limite total"
                  placeholder="5000.00"
                  inputMode="decimal"
                  disabled={formMethods.formState.isSubmitting}
                />

                <ControlledInput
                  name="cycle_limit_default"
                  label="Limite mensal"
                  placeholder="3000.00"
                  inputMode="decimal"
                  disabled={formMethods.formState.isSubmitting}
                />

                <ControlledInput
                  name="cycle_starts"
                  label="Início do ciclo (dia)"
                  type="number"
                  min={1}
                  max={31}
                  step={1}
                  disabled={formMethods.formState.isSubmitting}
                />

                <ControlledInput
                  name="cycle_ends"
                  label="Fim do ciclo (dia)"
                  type="number"
                  min={1}
                  max={31}
                  step={1}
                  disabled={formMethods.formState.isSubmitting}
                />

                <CardFooter className="justify-end px-0 pb-0">
                  <Button
                    type="submit"
                    disabled={formMethods.formState.isSubmitting}
                  >
                    {formMethods.formState.isSubmitting
                      ? "Salvando..."
                      : isEditMode
                        ? "Salvar alterações"
                        : "Criar carteira"}
                  </Button>
                </CardFooter>
              </form>
            </FormProvider>
          )}
        </CardContent>
      </Card>

      <HttpRequestResultDialog
        title={dialogTitle || "Resultado da requisição"}
        isOpen={dialogOpen}
        isSuccess={dialogStatus === "success"}
        statusCode={dialogResult.statusCode}
        message={dialogResult.body}
        closeAction={handleDialogClose}
        buttonTitle={dialogStatus === "success" ? "Voltar para carteiras" : "Fechar"}
        buttonAction={handleDialogClose}
      />
    </div>
  );
}
