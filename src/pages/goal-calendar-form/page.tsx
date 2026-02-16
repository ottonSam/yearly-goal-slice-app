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
  createGoalCalendar,
  getGoalCalendarById,
  updateGoalCalendar,
} from "@/api/goal-calendars";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { ControlledInput } from "@/components/form/ControlledInput";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/use-auth";
import { userScopedKey } from "@/lib/query-keys";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  goalCalendarFormSchema,
  goalCalendarResponseSchema,
  type GoalCalendarFormValues,
} from "@/schemas/goal-calendar";

function normalizeDateForInput(value: string) {
  return value.slice(0, 10);
}

export default function GoalCalendarFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const { goalCalendarId } = useParams<{ goalCalendarId: string }>();
  const isEditMode = Boolean(goalCalendarId);
  const [redirectGoalCalendarId, setRedirectGoalCalendarId] = React.useState<
    string | null
  >(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "success",
  );
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const formMethods = useForm<GoalCalendarFormValues>({
    resolver: zodResolver(goalCalendarFormSchema),
    defaultValues: {
      title: "",
      num_weeks: 12,
      start_date: "",
    },
  });

  const {
    data: goalCalendarData,
    isLoading: isLoadingCalendar,
    error,
  } = useQuery({
    queryKey: userScopedKey(
      userId,
      "goal-calendars",
      "edit",
      goalCalendarId ?? "unknown",
    ),
    enabled: isEditMode && Boolean(goalCalendarId),
    queryFn: async () => {
      const data = await getGoalCalendarById(goalCalendarId!);
      const parsed = goalCalendarResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }

      return parsed.data;
    },
  });

  React.useEffect(() => {
    if (!goalCalendarData) {
      return;
    }

    formMethods.reset({
      title: goalCalendarData.title,
      num_weeks: goalCalendarData.num_weeks,
      start_date: normalizeDateForInput(goalCalendarData.start_date),
    });
  }, [formMethods, goalCalendarData]);

  React.useEffect(() => {
    if (!error) {
      return;
    }

    const apiResult =
      error instanceof Error && error.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: error.message }
        : getApiErrorMessage(error);

    setDialogStatus("error");
    setDialogTitle("Não foi possível carregar o calendário");
    setDialogResult(apiResult);
    setDialogOpen(true);
  }, [error]);

  const onSubmit = async (data: GoalCalendarFormValues) => {
    try {
      const response =
        isEditMode && goalCalendarId
          ? await updateGoalCalendar(goalCalendarId, data)
          : await createGoalCalendar(data);

      const resultId = response.data.id ?? goalCalendarId;
      if (!resultId) {
        throw new Error("A API não retornou o id do calendário.");
      }

      setRedirectGoalCalendarId(String(resultId));
      setDialogStatus("success");
      setDialogTitle(
        isEditMode ? "Calendário atualizado" : "Calendário criado",
      );
      setDialogResult({
        statusCode: response.statusCode,
        body: isEditMode
          ? "O calendário foi atualizado com sucesso."
          : "O calendário foi criado com sucesso.",
      });
      setDialogOpen(true);
    } catch (error) {
      setRedirectGoalCalendarId(null);
      setDialogStatus("error");
      setDialogTitle(
        isEditMode
          ? "Não foi possível atualizar o calendário"
          : "Não foi possível criar o calendário",
      );
      setDialogResult(getApiErrorMessage(error));
      setDialogOpen(true);
    }
  };

  const onInvalid: SubmitErrorHandler<GoalCalendarFormValues> = (errors) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      formMethods.setFocus(firstField as keyof GoalCalendarFormValues);
    }
  };

  const handleModalClose = () => {
    setDialogOpen(false);
    if (dialogStatus === "success" && redirectGoalCalendarId) {
      navigate(`/goal-calendars/${redirectGoalCalendarId}`);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">
          {isEditMode ? "Editar calendário" : "Criar calendário"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Atualize os dados do calendário selecionado."
            : "Preencha os dados para criar um novo calendário."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dados do calendário</CardTitle>
          <CardDescription>
            Defina título, duração em semanas e data de início.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode && isLoadingCalendar ? (
            <p className="text-sm text-muted-foreground">
              Carregando dados do calendário...
            </p>
          ) : (
            <FormProvider {...formMethods}>
              <form
                className="space-y-4"
                onSubmit={formMethods.handleSubmit(onSubmit, onInvalid)}
              >
                <ControlledInput
                  name="title"
                  label="Título"
                  placeholder="Roadmap"
                  disabled={formMethods.formState.isSubmitting}
                />

                <ControlledInput
                  name="num_weeks"
                  label="Número de semanas"
                  type="number"
                  min={1}
                  step={1}
                  disabled={formMethods.formState.isSubmitting}
                />

                <ControlledInput
                  name="start_date"
                  label="Data de início"
                  type="date"
                  disabled={formMethods.formState.isSubmitting}
                />

                <CardFooter className="justify-end px-0 pb-0">
                  <Button
                    type="submit"
                    disabled={formMethods.formState.isSubmitting}
                  >
                    {formMethods.formState.isSubmitting
                      ? isEditMode
                        ? "Salvando..."
                        : "Criando..."
                      : isEditMode
                        ? "Salvar alterações"
                        : "Criar calendário"}
                  </Button>
                </CardFooter>
              </form>
            </FormProvider>
          )}
        </CardContent>
      </Card>

      <HttpRequestResultDialog
        title={dialogTitle}
        isOpen={dialogOpen}
        isSuccess={dialogStatus === "success"}
        statusCode={dialogResult.statusCode}
        message={dialogResult.body}
        closeAction={handleModalClose}
        buttonTitle={dialogStatus === "success" ? "Ver detalhes" : "Fechar"}
        buttonAction={handleModalClose}
      />
    </div>
  );
}
