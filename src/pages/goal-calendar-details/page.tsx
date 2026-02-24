import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { getGoalCalendarById } from "@/api/goal-calendars";
import {
  createWeeklyActivity,
  listActivityMetricTypes,
  listWeeklyActivities,
  progressWeeklyActivityFrequency,
  progressWeeklyActivityQuantity,
  progressWeeklyActivitySpecificDays,
  updateWeeklyActivity,
  type ActivityDay,
} from "@/api/weekly-activities";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { ActivityCard } from "@/components/ActivityCard";
import { ActivityFormDialog } from "@/components/ActivityFormDialog";
import { type ActivityProgressPayload } from "@/components/ActivityProgressDialog";
import { ActivityReportExportDialog } from "@/components/ActivityReportExportDialog";
import { GoalWeekCalendar } from "@/components/GoalWeekCalendar";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/use-auth";
import { userScopedKey } from "@/lib/query-keys";
import { goalCalendarDetailsSchema } from "@/schemas/goal-calendar";
import {
  weeklyActivityFormSchema,
  weeklyActivityListSchema,
  type WeeklyActivityDay,
  type WeeklyActivityFormValues,
  type WeeklyActivityMetricType,
} from "@/schemas/weekly-activity";
import { Progress } from "@/components/ui/progress";
import { CodePre } from "@/components/CodePre";

const DAY_OPTIONS: Array<{ value: WeeklyActivityDay; label: string }> = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const DEFAULT_METRIC_TYPES: WeeklyActivityMetricType[] = [
  "FREQUENCY",
  "QUANTITY",
  "SPECIFIC_DAYS",
];
const ACTIVITY_DAY_BY_WEEKDAY_INDEX: WeeklyActivityDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseIsoDateLocal(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysLocal(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getTodayIsoLocal() {
  const today = new Date();
  return formatIsoDateLocal(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
}

function collectMarkedDatesForSpecificDays(
  startDate: string,
  endDate: string,
  specificDays: WeeklyActivityDay[],
) {
  if (specificDays.length === 0) {
    return [];
  }

  const markedDates: string[] = [];
  const daySet = new Set(specificDays);
  const start = parseIsoDateLocal(startDate);
  const end = parseIsoDateLocal(endDate);

  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor = addDaysLocal(cursor, 1)
  ) {
    const activityDay = ACTIVITY_DAY_BY_WEEKDAY_INDEX[cursor.getDay()];
    if (daySet.has(activityDay)) {
      markedDates.push(formatIsoDateLocal(cursor));
    }
  }

  return markedDates;
}

function getMetricTypeLabel(metricType: WeeklyActivityMetricType) {
  if (metricType === "FREQUENCY") {
    return "Frequência";
  }

  if (metricType === "QUANTITY") {
    return "Quantidade";
  }

  return "Dias específicos";
}

function getSpecificDaysLabel(days: WeeklyActivityDay[] | null | undefined) {
  return (
    (days ?? [])
      .map((day) =>
        (
          DAY_OPTIONS.find((option) => option.value === day)?.label ?? day
        ).slice(0, 3),
      )
      .join(", ") || "Nenhum"
  );
}

function normalizeMetricTypes(data: unknown): WeeklyActivityMetricType[] {
  if (!Array.isArray(data)) {
    return DEFAULT_METRIC_TYPES;
  }

  const values = data
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object" && "value" in item) {
        return String((item as { value: unknown }).value);
      }

      return null;
    })
    .filter(
      (value): value is WeeklyActivityMetricType =>
        value === "FREQUENCY" ||
        value === "QUANTITY" ||
        value === "SPECIFIC_DAYS",
    );

  if (values.length === 0) {
    return DEFAULT_METRIC_TYPES;
  }

  return values;
}

function toApiErrorResult(error: unknown): ApiErrorResult {
  if (error instanceof Error && error.message === "Resposta inválida da API.") {
    return { statusCode: undefined, body: error.message };
  }

  return getApiErrorMessage(error);
}

export default function GoalCalendarDetailsPage() {
  const { goalCalendarId } = useParams<{ goalCalendarId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const [selectedWeekId, setSelectedWeekId] = React.useState<string>("");
  const [selectedActivityId, setSelectedActivityId] =
    React.useState<string>("");
  const [editingActivityId, setEditingActivityId] = React.useState<
    string | null
  >(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "error",
  );
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });
  const [isCreateActivityFormOpen, setIsCreateActivityFormOpen] =
    React.useState(false);
  const [isAddReportDialogOpen, setIsAddReportDialogOpen] =
    React.useState(false);

  const activityForm = useForm<WeeklyActivityFormValues>({
    resolver: zodResolver(weeklyActivityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      metric_type: "FREQUENCY",
      target_frequency: 1,
      target_quantity: undefined,
      specific_days: [],
    },
  });

  const {
    data: calendar,
    isLoading: isLoadingCalendar,
    error: calendarError,
  } = useQuery({
    queryKey: userScopedKey(
      userId,
      "goal-calendars",
      goalCalendarId ?? "unknown",
    ),
    enabled: Boolean(goalCalendarId),
    queryFn: async () => {
      const data = await getGoalCalendarById(goalCalendarId!);
      const parsed = goalCalendarDetailsSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }

      return parsed.data;
    },
  });

  const weeks = React.useMemo(() => {
    if (!calendar) {
      return [];
    }

    return [...calendar.weeks]
      .filter((week) => week.active)
      .sort((a, b) => a.week_num - b.week_num);
  }, [calendar]);

  const currentWeekId = React.useMemo(() => {
    if (weeks.length === 0) {
      return "";
    }

    const todayIso = getTodayIsoLocal();
    const currentWeek = weeks.find(
      (week) => week.start_week <= todayIso && week.end_week >= todayIso,
    );

    return currentWeek?.id ?? "";
  }, [weeks]);

  const defaultWeekId = React.useMemo(() => {
    if (weeks.length === 0) {
      return "";
    }

    return currentWeekId || weeks[weeks.length - 1].id;
  }, [currentWeekId, weeks]);

  React.useEffect(() => {
    setSelectedWeekId(defaultWeekId);
  }, [defaultWeekId]);

  const selectedWeek = React.useMemo(() => {
    if (!selectedWeekId) {
      return null;
    }

    return weeks.find((week) => week.id === selectedWeekId) ?? null;
  }, [selectedWeekId, weeks]);
  const selectedWeekReport = React.useMemo(
    () => selectedWeek?.report?.trim() ?? "",
    [selectedWeek],
  );
  const canShowReportExportDialog = React.useMemo(() => {
    if (!selectedWeek) {
      return false;
    }

    return getTodayIsoLocal() >= selectedWeek.end_week;
  }, [selectedWeek]);

  const { data: metricTypes = DEFAULT_METRIC_TYPES, error: metricTypesError } =
    useQuery({
      queryKey: userScopedKey(
        userId,
        "goal-calendars",
        "activities",
        "metric-types",
      ),
      queryFn: async () => {
        const data = await listActivityMetricTypes();
        return normalizeMetricTypes(data);
      },
    });

  const {
    data: activities = [],
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: userScopedKey(
      userId,
      "goal-calendars",
      "weeks",
      selectedWeekId || "unknown",
      "activities",
    ),
    enabled: Boolean(selectedWeekId),
    queryFn: async () => {
      const data = await listWeeklyActivities(selectedWeekId);
      const parsed = weeklyActivityListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }

      return parsed.data;
    },
  });

  React.useEffect(() => {
    if (activities.length === 0) {
      setSelectedActivityId("");
      return;
    }

    setSelectedActivityId((current) => {
      if (current && activities.some((activity) => activity.id === current)) {
        return current;
      }

      return activities[0].id;
    });
  }, [activities]);

  const selectedActivity = React.useMemo(() => {
    if (!selectedActivityId) {
      return null;
    }

    return (
      activities.find((activity) => activity.id === selectedActivityId) ?? null
    );
  }, [activities, selectedActivityId]);

  const markedDates = React.useMemo(() => {
    if (!selectedWeek || !selectedActivity) {
      return [];
    }

    if (selectedActivity.metric_type !== "SPECIFIC_DAYS") {
      return [];
    }

    return collectMarkedDatesForSpecificDays(
      selectedWeek.start_week,
      selectedWeek.end_week,
      selectedActivity.specific_days ?? [],
    );
  }, [selectedActivity, selectedWeek]);

  const calendarEndDate = React.useMemo(() => {
    if (!calendar) {
      return "";
    }

    return (
      calendar.end_date ??
      weeks[weeks.length - 1]?.end_week ??
      calendar.start_date
    );
  }, [calendar, weeks]);

  React.useEffect(() => {
    const currentError = calendarError ?? metricTypesError ?? activitiesError;
    if (!currentError) {
      return;
    }

    setDialogStatus("error");
    setDialogTitle("Não foi possível carregar os dados da semana");
    setDialogResult(toApiErrorResult(currentError));
    setDialogOpen(true);
  }, [activitiesError, calendarError, metricTypesError]);

  const activityMutation = useMutation({
    mutationFn: async (values: WeeklyActivityFormValues) => {
      if (!selectedWeekId) {
        throw new Error("Semana não selecionada.");
      }

      const payload = {
        title: values.title,
        description: values.description,
        metric_type: values.metric_type,
        target_frequency:
          values.metric_type === "FREQUENCY"
            ? values.target_frequency
            : undefined,
        target_quantity:
          values.metric_type === "QUANTITY"
            ? values.target_quantity
            : undefined,
        specific_days:
          values.metric_type === "SPECIFIC_DAYS"
            ? values.specific_days
            : undefined,
      };

      if (editingActivityId) {
        return updateWeeklyActivity(selectedWeekId, editingActivityId, payload);
      }

      return createWeeklyActivity(selectedWeekId, payload);
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userScopedKey(
            userId,
            "goal-calendars",
            "weeks",
            selectedWeekId || "unknown",
            "activities",
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: userScopedKey(
            userId,
            "goal-calendars",
            "weeks",
            selectedWeekId || "unknown",
            "activities",
            "report",
          ),
        }),
      ]);

      setDialogStatus("success");
      setDialogTitle(
        editingActivityId ? "Atividade atualizada" : "Atividade criada",
      );
      setDialogResult({
        statusCode: response.statusCode,
        body: editingActivityId
          ? "A atividade foi atualizada com sucesso."
          : "A atividade foi criada com sucesso.",
      });
      setDialogOpen(true);

      setEditingActivityId(null);
      setIsCreateActivityFormOpen(false);
      activityForm.reset({
        title: "",
        description: "",
        metric_type: "FREQUENCY",
        target_frequency: 1,
        target_quantity: undefined,
        specific_days: [],
      });
    },
    onError: (error) => {
      setDialogStatus("error");
      setDialogTitle(
        editingActivityId
          ? "Não foi possível atualizar a atividade"
          : "Não foi possível criar a atividade",
      );
      setDialogResult(toApiErrorResult(error));
      setDialogOpen(true);
    },
  });

  const progressMutation = useMutation({
    mutationFn: async ({
      activityId,
      payload,
    }: {
      activityId: string;
      payload: ActivityProgressPayload;
    }) => {
      if (!selectedWeekId) {
        throw new Error("Semana não selecionada.");
      }

      if (payload.metricType === "QUANTITY") {
        return progressWeeklyActivityQuantity(
          selectedWeekId,
          activityId,
          payload.amount,
        );
      }

      if (payload.metricType === "FREQUENCY") {
        return progressWeeklyActivityFrequency(
          selectedWeekId,
          activityId,
          payload.day as ActivityDay,
        );
      }

      return progressWeeklyActivitySpecificDays(
        selectedWeekId,
        activityId,
        payload.day as ActivityDay,
      );
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userScopedKey(
            userId,
            "goal-calendars",
            "weeks",
            selectedWeekId || "unknown",
            "activities",
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: userScopedKey(
            userId,
            "goal-calendars",
            "weeks",
            selectedWeekId || "unknown",
            "activities",
            "report",
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: userScopedKey(
            userId,
            "goal-calendars",
            goalCalendarId ?? "unknown",
          ),
        }),
      ]);

      setDialogStatus("success");
      setDialogTitle("Progresso registrado");
      setDialogResult({
        statusCode: response.statusCode,
        body: "O progresso da atividade foi registrado com sucesso.",
      });
      setDialogOpen(true);
    },
    onError: (error) => {
      setDialogStatus("error");
      setDialogTitle("Não foi possível registrar o progresso");
      setDialogResult(toApiErrorResult(error));
      setDialogOpen(true);
    },
  });

  const handleStartEditActivity = (activityId: string) => {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) {
      return;
    }

    setEditingActivityId(activity.id);
    activityForm.reset({
      title: activity.title,
      description: activity.description ?? "",
      metric_type: activity.metric_type,
      target_frequency: activity.target_frequency ?? undefined,
      target_quantity: activity.target_quantity ?? undefined,
      specific_days: activity.specific_days ?? [],
    });
    setIsCreateActivityFormOpen(false);
  };

  const handleStartCreateActivity = () => {
    setEditingActivityId(null);
    activityForm.reset({
      title: "",
      description: "",
      metric_type: "FREQUENCY",
      target_frequency: 1,
      target_quantity: undefined,
      specific_days: [],
    });
    setIsCreateActivityFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingActivityId(null);
    activityForm.reset({
      title: "",
      description: "",
      metric_type: "FREQUENCY",
      target_frequency: 1,
      target_quantity: undefined,
      specific_days: [],
    });
    setIsCreateActivityFormOpen(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 my-auto">
          <h1 className="font-display text-4xl font-semibold">
            {calendar?.title ?? "Detalhes do calendário"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seu progresso e metas semanais
          </p>
        </div>
        <div className="my-auto flex flex-1 lg:max-w-100 lg:flex-col flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex flex-1"
            onClick={() => navigate("/goal-calendars")}
          >
            Voltar para lista
          </Button>
          {goalCalendarId ? (
            <Button
              className="flex flex-1"
              onClick={() => navigate(`/goal-calendars/edit/${goalCalendarId}`)}
            >
              Editar calendário
            </Button>
          ) : null}
        </div>
      </header>

      {isLoadingCalendar ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Carregando detalhes do calendário...
          </CardContent>
        </Card>
      ) : !calendar ? (
        <Card>
          <CardHeader>
            <CardTitle>Calendário não encontrado</CardTitle>
            <CardDescription>
              Verifique o ID do calendário e tente novamente.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {weeks.length > 0 && calendarEndDate ? (
            <GoalWeekCalendar
              startDate={calendar.start_date}
              endDate={calendarEndDate}
              weeks={weeks}
              selectedWeekId={selectedWeekId}
              currentWeekId={currentWeekId}
              markedDates={markedDates}
              onWeekSelect={setSelectedWeekId}
            />
          ) : null}

          {weeks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Nenhuma semana ativa encontrada neste calendário.
              </CardContent>
            </Card>
          ) : selectedWeek ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Resumo da semana</CardTitle>
                  <CardDescription>
                    {selectedWeek.average_completion_percentage.toFixed(2)}%
                  </CardDescription>
                </div>
                <Progress
                  percentage={selectedWeek.average_completion_percentage}
                  className="h-3"
                />
              </CardHeader>
              <CardContent className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                <span className="font-medium text-foreground">
                  Relatório da semana:{" "}
                </span>
                {selectedWeekReport ? (
                  <p className="rounded-md text-justify border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed text-foreground">
                    {selectedWeekReport}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {canShowReportExportDialog ? (
                      <ActivityReportExportDialog
                        weekId={selectedWeek.id}
                        open={isAddReportDialogOpen}
                        onOpenChange={setIsAddReportDialogOpen}
                        title="Adicionar relatório"
                        description="Descreva sua reflexão da semana para gerar o relatório."
                        trigger={
                          <Button
                            type="button"
                            size="lg"
                            className="w-fit mx-auto mt-2"
                            disabled={!selectedWeek.id}
                          >
                            Adicionar relatório
                          </Button>
                        }
                        onSuccess={async (result) => {
                          await Promise.all([
                            queryClient.invalidateQueries({
                              queryKey: userScopedKey(
                                userId,
                                "goal-calendars",
                                goalCalendarId ?? "unknown",
                              ),
                            }),
                            queryClient.invalidateQueries({
                              queryKey: userScopedKey(
                                userId,
                                "goal-calendars",
                                "weeks",
                                selectedWeekId || "unknown",
                                "activities",
                                "report",
                              ),
                            }),
                          ]);

                          setDialogStatus("success");
                          setDialogTitle("Relatório atualizado");
                          setDialogResult({
                            statusCode: result.statusCode,
                            body: "O relatório da semana foi atualizado com sucesso.",
                          });
                          setDialogOpen(true);
                        }}
                        onError={(error) => {
                          setDialogStatus("error");
                          setDialogTitle(
                            "Não foi possível atualizar o relatório",
                          );
                          setDialogResult(error);
                          setDialogOpen(true);
                        }}
                      />
                    ) : (
                      <CodePre value="Pendente" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Selecione uma semana para visualizar os detalhes.
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Suas atividades
            </label>
            <ActivityFormDialog
              open={isCreateActivityFormOpen}
              mode="create"
              onOpenChange={(open) => {
                setIsCreateActivityFormOpen(open);
                if (!open && !activityMutation.isPending) {
                  setEditingActivityId(null);
                  activityForm.reset({
                    title: "",
                    description: "",
                    metric_type: "FREQUENCY",
                    target_frequency: 1,
                    target_quantity: undefined,
                    specific_days: [],
                  });
                }
              }}
              form={activityForm}
              metricTypes={metricTypes}
              dayOptions={DAY_OPTIONS}
              isPending={activityMutation.isPending}
              onSubmit={(values) => activityMutation.mutate(values)}
              onCancel={handleCancelEdit}
              onStartCreate={handleStartCreateActivity}
              getMetricTypeLabel={getMetricTypeLabel}
            />
          </div>

          {isLoadingActivities ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Carregando atividades...
              </CardContent>
            </Card>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityCard
                title={activity.title}
                description={activity.description}
                progressValueLabel={`${activity.completion_percentage.toFixed(2)}%`}
                goalLabel={
                  activity.metric_type === "FREQUENCY"
                    ? `${activity.target_frequency ?? 0} vezes`
                    : activity.metric_type === "QUANTITY"
                      ? String(activity.target_quantity ?? 0)
                      : getSpecificDaysLabel(activity.specific_days ?? [])
                }
                metricLabel={getMetricTypeLabel(activity.metric_type)}
                onEdit={() => handleStartEditActivity(activity.id)}
                progressMetricType={activity.metric_type}
                progressDayOptions={
                  activity.metric_type === "SPECIFIC_DAYS"
                    ? DAY_OPTIONS.filter((dayOption) =>
                        (activity.specific_days ?? []).includes(
                          dayOption.value,
                        ),
                      )
                    : DAY_OPTIONS
                }
                progressPending={progressMutation.isPending}
                markProgressDisabled={
                  progressMutation.isPending ||
                  (activity.metric_type === "SPECIFIC_DAYS" &&
                    (activity.specific_days ?? []).length === 0)
                }
                onMarkProgress={(payload) =>
                  progressMutation.mutate({
                    activityId: activity.id,
                    payload,
                  })
                }
                editDialogProps={{
                  open: editingActivityId === activity.id,
                  onOpenChange: (open) => {
                    if (!open && !activityMutation.isPending) {
                      handleCancelEdit();
                    }
                  },
                  form: activityForm,
                  metricTypes,
                  dayOptions: DAY_OPTIONS,
                  isPending: activityMutation.isPending,
                  onSubmit: (values) => activityMutation.mutate(values),
                  onCancel: handleCancelEdit,
                  getMetricTypeLabel,
                }}
              />
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Nenhuma atividade cadastrada para esta semana.
              </CardContent>
            </Card>
          )}
        </>
      )}

      <HttpRequestResultDialog
        title={dialogTitle || "Resultado da requisição"}
        isOpen={dialogOpen}
        isSuccess={dialogStatus === "success"}
        statusCode={dialogResult.statusCode}
        message={dialogResult.body}
        closeAction={() => setDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setDialogOpen(false)}
      />
    </div>
  );
}
