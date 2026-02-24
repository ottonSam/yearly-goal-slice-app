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
  createObjective,
  getObjectiveById,
  updateObjective,
} from "@/api/objectives";
import { listGoalCalendars } from "@/api/goal-calendars";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
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
import { goalCalendarListSchema } from "@/schemas/goal-calendar";
import {
  objectiveFormSchema,
  objectiveSchema,
  type ObjectiveFormValues,
  type ObjectiveType,
} from "@/schemas/objective";

const OBJECTIVE_TYPE_OPTIONS: Array<{ value: ObjectiveType; label: string }> = [
  { value: "LONG_TERM", label: "Longo prazo" },
  { value: "MEDIUM_TERM", label: "Médio prazo" },
  { value: "GOAL_CALENDAR", label: "Calendário" },
];

function isObjectiveCompleted(objective: {
  completed?: boolean;
  is_completed?: boolean;
}) {
  return Boolean(objective.completed ?? objective.is_completed);
}

export default function ObjectiveFormPage() {
  const navigate = useNavigate();
  const { objectiveId } = useParams<{ objectiveId: string }>();
  const isEditMode = Boolean(objectiveId);
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

  const formMethods = useForm<ObjectiveFormValues>({
    resolver: zodResolver(objectiveFormSchema),
    defaultValues: {
      objective_type: "LONG_TERM",
      goal_calendar: "",
      title: "",
      description: "",
    },
  });

  const watchedObjectiveType = formMethods.watch("objective_type");

  const { data: goalCalendars = [] } = useQuery({
    queryKey: userScopedKey(userId, "goal-calendars"),
    queryFn: async () => {
      const data = await listGoalCalendars();
      const parsed = goalCalendarListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  const {
    data: objectiveData,
    isLoading: isLoadingObjective,
    error: objectiveError,
  } = useQuery({
    queryKey: userScopedKey(
      userId,
      "objectives",
      "detail",
      objectiveId ?? "unknown",
    ),
    enabled: isEditMode && Boolean(objectiveId),
    queryFn: async () => {
      const data = await getObjectiveById(objectiveId!);
      const parsed = objectiveSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  React.useEffect(() => {
    if (!objectiveData) {
      return;
    }

    formMethods.reset({
      objective_type: objectiveData.objective_type,
      goal_calendar: objectiveData.goal_calendar
        ? String(objectiveData.goal_calendar)
        : "",
      title: objectiveData.title,
      description: objectiveData.description ?? "",
    });
  }, [formMethods, objectiveData]);

  React.useEffect(() => {
    if (!objectiveError) {
      return;
    }

    setDialogStatus("error");
    setDialogTitle("Não foi possível carregar o objetivo");
    setDialogResult(getApiErrorMessage(objectiveError));
    setDialogOpen(true);
  }, [objectiveError]);

  const isCompletedObjective = Boolean(
    isEditMode && objectiveData && isObjectiveCompleted(objectiveData),
  );

  const onSubmit = async (values: ObjectiveFormValues) => {
    if (isCompletedObjective) {
      setDialogStatus("error");
      setDialogTitle("Objetivo concluído não pode ser editado");
      setDialogResult({
        statusCode: undefined,
        body: "Este objetivo já está concluído e não pode ser alterado no front.",
      });
      setDialogOpen(true);
      return;
    }

    try {
      const payload = {
        objective_type: values.objective_type,
        title: values.title,
        description: values.description,
        goal_calendar:
          values.objective_type === "GOAL_CALENDAR"
            ? values.goal_calendar
            : undefined,
      };

      const response =
        isEditMode && objectiveId
          ? await updateObjective(objectiveId, payload)
          : await createObjective(payload);

      setDialogStatus("success");
      setDialogTitle(isEditMode ? "Objetivo atualizado" : "Objetivo criado");
      setDialogResult({
        statusCode: response.statusCode,
        body: isEditMode
          ? "O objetivo foi atualizado com sucesso."
          : "O objetivo foi criado com sucesso.",
      });
      setDialogOpen(true);
    } catch (error) {
      setDialogStatus("error");
      setDialogTitle(
        isEditMode
          ? "Não foi possível atualizar o objetivo"
          : "Não foi possível criar o objetivo",
      );
      setDialogResult(getApiErrorMessage(error));
      setDialogOpen(true);
    }
  };

  const onInvalid: SubmitErrorHandler<ObjectiveFormValues> = (errors) => {
    const firstField = Object.keys(errors)[0];
    if (firstField) {
      formMethods.setFocus(firstField as keyof ObjectiveFormValues);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">
          {isEditMode ? "Editar objetivo" : "Criar objetivo"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados e selecione o tipo de objetivo.
        </p>
        {isCompletedObjective ? (
          <p className="text-sm text-destructive">
            Objetivos concluídos não podem ser editados.
          </p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dados do objetivo</CardTitle>
          <CardDescription>
            Defina título, descrição e o tipo para classificar o objetivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode && isLoadingObjective ? (
            <p className="text-sm text-muted-foreground">
              Carregando objetivo...
            </p>
          ) : (
            <FormProvider {...formMethods}>
              <form
                className="space-y-4"
                onSubmit={formMethods.handleSubmit(onSubmit, onInvalid)}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="objective-type"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Tipo
                  </label>
                  <select
                    id="objective-type"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    value={watchedObjectiveType}
                    disabled={isCompletedObjective}
                    onChange={(event) =>
                      formMethods.setValue(
                        "objective_type",
                        event.target.value as ObjectiveType,
                        { shouldValidate: true },
                      )
                    }
                  >
                    {OBJECTIVE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {watchedObjectiveType === "GOAL_CALENDAR" ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="objective-goal-calendar"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Calendário
                    </label>
                    <select
                      id="objective-goal-calendar"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      value={formMethods.watch("goal_calendar") ?? ""}
                      disabled={isCompletedObjective}
                      onChange={(event) =>
                        formMethods.setValue(
                          "goal_calendar",
                          event.target.value,
                          {
                            shouldValidate: true,
                          },
                        )
                      }
                    >
                      <option value="">Selecione um calendário</option>
                      {goalCalendars.map((goalCalendar) => (
                        <option
                          key={String(goalCalendar.id)}
                          value={String(goalCalendar.id)}
                        >
                          {goalCalendar.title}
                        </option>
                      ))}
                    </select>
                    {formMethods.formState.errors.goal_calendar?.message ? (
                      <p className="text-sm text-destructive">
                        {formMethods.formState.errors.goal_calendar.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <ControlledInput
                  name="title"
                  label="Título"
                  placeholder="Ex.: Sprint da semana"
                  disabled={isCompletedObjective}
                />

                <ControlledInput
                  name="description"
                  label="Descrição"
                  placeholder="Descreva o objetivo"
                  disabled={isCompletedObjective}
                />

                <CardFooter className="justify-end px-0 pb-0">
                  {isCompletedObjective ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/objectives")}
                    >
                      Voltar para objetivos
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={formMethods.formState.isSubmitting}
                    >
                      {formMethods.formState.isSubmitting
                        ? "Salvando..."
                        : isEditMode
                          ? "Salvar alterações"
                          : "Criar objetivo"}
                    </Button>
                  )}
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
        closeAction={() => {
          setDialogOpen(false);
          if (dialogStatus === "success") {
            navigate("/objectives");
          }
        }}
        buttonTitle={
          dialogStatus === "success" ? "Voltar para objetivos" : "Fechar"
        }
        buttonAction={() => {
          setDialogOpen(false);
          if (dialogStatus === "success") {
            navigate("/objectives");
          }
        }}
      />
    </div>
  );
}
