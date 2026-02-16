import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { getGoalCalendarById } from "@/api/goal-calendars";
import {
  createWeeklyActivity,
  getWeeklyActivityReport,
  listActivityMetricTypes,
  listWeeklyActivities,
  progressWeeklyActivityFrequency,
  progressWeeklyActivityQuantity,
  progressWeeklyActivitySpecificDays,
  updateWeeklyActivity,
  type ActivityDay,
} from "@/api/weekly-activities";
import { formatDateLongPtBr } from "@/assets/utils/formatDateLongPtBr";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

function getMetricTypeLabel(metricType: WeeklyActivityMetricType) {
  if (metricType === "FREQUENCY") {
    return "Frequência";
  }

  if (metricType === "QUANTITY") {
    return "Quantidade";
  }

  return "Dias específicos";
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

function parsePercent(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }

  if (typeof value === "string") {
    const numeric = Number(value.replace("%", "").trim());
    if (Number.isFinite(numeric)) {
      return Math.max(0, Math.min(100, numeric));
    }
  }

  return null;
}

function collectActivityCompletionById(report: unknown) {
  const completionById: Record<string, number> = {};
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return completionById;
  }

  const reportRecord = report as Record<string, unknown>;
  if (!Array.isArray(reportRecord.progress)) {
    return completionById;
  }

  for (const item of reportRecord.progress) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const itemRecord = item as Record<string, unknown>;
    const rawId = itemRecord.id ?? itemRecord.activity_id;
    if (typeof rawId !== "string" && typeof rawId !== "number") {
      continue;
    }

    const parsedProgress = parsePercent(itemRecord.progress);
    if (parsedProgress === null) {
      continue;
    }

    completionById[String(rawId)] = parsedProgress;
  }

  return completionById;
}

function extractWeekCompletionPercent(report: unknown) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return null;
  }

  const reportRecord = report as Record<string, unknown>;
  return parsePercent(reportRecord.general_progress);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Sem dados";
  }

  const rounded = Math.round(value * 10) / 10;
  return `${String(rounded).replace(".", ",")}%`;
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
  const [progressDayByActivity, setProgressDayByActivity] = React.useState<
    Record<string, ActivityDay>
  >({});
  const [progressAmountByActivity, setProgressAmountByActivity] =
    React.useState<Record<string, number>>({});

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "error",
  );
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });
  const activityFormCardRef = React.useRef<HTMLDivElement | null>(null);

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

  const watchedMetricType = activityForm.watch("metric_type");
  const watchedSpecificDays = activityForm.watch("specific_days") ?? [];

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

  const defaultWeekId = React.useMemo(() => {
    if (weeks.length === 0) {
      return "";
    }

    const today = new Date();
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayIso = localToday.toISOString().slice(0, 10);

    const currentWeek = weeks.find(
      (week) => week.start_week <= todayIso && week.end_week >= todayIso,
    );

    return currentWeek?.id ?? weeks[weeks.length - 1].id;
  }, [weeks]);

  React.useEffect(() => {
    setSelectedWeekId(defaultWeekId);
  }, [defaultWeekId]);

  const selectedWeek = React.useMemo(() => {
    if (!selectedWeekId) {
      return null;
    }

    return weeks.find((week) => week.id === selectedWeekId) ?? null;
  }, [selectedWeekId, weeks]);

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

  const { data: activityReport, error: reportError } = useQuery({
    queryKey: userScopedKey(
      userId,
      "goal-calendars",
      "weeks",
      selectedWeekId || "unknown",
      "activities",
      "report",
    ),
    enabled: Boolean(selectedWeekId),
    queryFn: async () => getWeeklyActivityReport(selectedWeekId),
  });

  const completionByActivityId = React.useMemo(
    () => collectActivityCompletionById(activityReport),
    [activityReport],
  );

  const weekCompletionPercent = React.useMemo(
    () => extractWeekCompletionPercent(activityReport),
    [activityReport],
  );

  React.useEffect(() => {
    const currentError =
      calendarError ?? metricTypesError ?? activitiesError ?? reportError;
    if (!currentError) {
      return;
    }

    setDialogStatus("error");
    setDialogTitle("Não foi possível carregar os dados da semana");
    setDialogResult(toApiErrorResult(currentError));
    setDialogOpen(true);
  }, [activitiesError, calendarError, metricTypesError, reportError]);

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
    mutationFn: async (params: {
      activityId: string;
      metricType: WeeklyActivityMetricType;
      day?: ActivityDay;
      amount?: number;
    }) => {
      if (!selectedWeekId) {
        throw new Error("Semana não selecionada.");
      }

      if (
        (params.metricType === "FREQUENCY" ||
          params.metricType === "SPECIFIC_DAYS") &&
        !params.day
      ) {
        throw new Error("Selecione um dia para marcar o progresso.");
      }

      if (params.metricType === "QUANTITY" && !params.amount) {
        throw new Error("Informe uma quantidade para marcar o progresso.");
      }

      if (params.metricType === "FREQUENCY") {
        return progressWeeklyActivityFrequency(
          selectedWeekId,
          params.activityId,
          params.day!,
        );
      }

      if (params.metricType === "QUANTITY") {
        return progressWeeklyActivityQuantity(
          selectedWeekId,
          params.activityId,
          params.amount!,
        );
      }

      return progressWeeklyActivitySpecificDays(
        selectedWeekId,
        params.activityId,
        params.day!,
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
      ]);

      setDialogStatus("success");
      setDialogTitle("Progresso registrado");
      setDialogResult({
        statusCode: response.statusCode,
        body: "O progresso da atividade foi atualizado.",
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

    requestAnimationFrame(() => {
      activityFormCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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
  };

  const handleToggleSpecificDay = (day: WeeklyActivityDay) => {
    const currentDays = activityForm.getValues("specific_days") ?? [];
    const nextDays = currentDays.includes(day)
      ? currentDays.filter((item) => item !== day)
      : [...currentDays, day];

    activityForm.setValue("specific_days", nextDays, { shouldValidate: true });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">
            {calendar?.title ?? "Detalhes do calendário"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualização geral do calendário e gerenciamento das semanas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/goal-calendars")}>
            Voltar para lista
          </Button>
          {goalCalendarId ? (
            <Button
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
          <Card>
            <CardHeader>
              <CardTitle>Resumo do calendário</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              <p>
                <span className="font-medium text-foreground">Início: </span>
                {formatDateLongPtBr(calendar.start_date)}
              </p>
              <p>
                <span className="font-medium text-foreground">Fim: </span>
                {calendar.end_date
                  ? formatDateLongPtBr(calendar.end_date)
                  : "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Semanas: </span>
                {calendar.num_weeks}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento das semanas</CardTitle>
              <CardDescription>
                Selecione uma semana ativa para visualizar os detalhes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="week-select"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Semana
                </label>
                <select
                  key={defaultWeekId}
                  id="week-select"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  defaultValue={defaultWeekId}
                  onChange={(event) => setSelectedWeekId(event.target.value)}
                >
                  {weeks.map((week) => (
                    <option key={week.id} value={week.id}>
                      Semana {week.week_num}
                    </option>
                  ))}
                </select>
              </div>

              {weeks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Nenhuma semana ativa encontrada neste calendário.
                  </CardContent>
                </Card>
              ) : selectedWeek ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Semana {selectedWeek.week_num}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-foreground">
                        Início:{" "}
                      </span>
                      {formatDateLongPtBr(selectedWeek.start_week)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Fim: </span>
                      {formatDateLongPtBr(selectedWeek.end_week)}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-medium text-foreground">
                        Relatório da semana:{" "}
                      </span>
                      {selectedWeek.report ? "Disponível" : "Pendente"}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-medium text-foreground">
                        Concluído na semana:{" "}
                      </span>
                      {formatPercent(weekCompletionPercent)}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Selecione uma semana para visualizar os detalhes.
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="activity-select"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Atividade
                </label>
                <select
                  id="activity-select"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  value={selectedActivityId}
                  onChange={(event) =>
                    setSelectedActivityId(event.target.value)
                  }
                  disabled={isLoadingActivities || activities.length === 0}
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </select>
              </div>

              {isLoadingActivities ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Carregando atividades...
                  </CardContent>
                </Card>
              ) : selectedActivity ? (
                <Card>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">
                      {selectedActivity.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedActivity.description || "Sem descrição."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Métrica:{" "}
                      </span>
                      {getMetricTypeLabel(selectedActivity.metric_type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Concluído:{" "}
                      </span>
                      {formatPercent(
                        completionByActivityId[selectedActivity.id] ?? null,
                      )}
                    </p>

                    {selectedActivity.metric_type === "FREQUENCY" ? (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Meta:{" "}
                        </span>
                        {selectedActivity.target_frequency ?? 0} vezes
                      </p>
                    ) : null}

                    {selectedActivity.metric_type === "QUANTITY" ? (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Meta:{" "}
                        </span>
                        {selectedActivity.target_quantity ?? 0}
                      </p>
                    ) : null}

                    {selectedActivity.metric_type === "SPECIFIC_DAYS" ? (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Dias:{" "}
                        </span>
                        {(selectedActivity.specific_days ?? [])
                          .map(
                            (day) =>
                              DAY_OPTIONS.find((option) => option.value === day)
                                ?.label ?? day,
                          )
                          .join(", ") || "Nenhum"}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          handleStartEditActivity(selectedActivity.id)
                        }
                      >
                        Editar
                      </Button>
                    </div>

                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="text-sm font-medium">Progresso</p>
                      {selectedActivity.metric_type === "QUANTITY" ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            className="w-32"
                            value={
                              progressAmountByActivity[selectedActivity.id] ?? 1
                            }
                            onChange={(event) =>
                              setProgressAmountByActivity((current) => ({
                                ...current,
                                [selectedActivity.id]: Number(
                                  event.target.value || 1,
                                ),
                              }))
                            }
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              progressMutation.mutate({
                                activityId: selectedActivity.id,
                                metricType: "QUANTITY",
                                amount:
                                  progressAmountByActivity[
                                    selectedActivity.id
                                  ] ?? 1,
                              })
                            }
                            disabled={progressMutation.isPending}
                          >
                            Registrar quantidade
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            value={
                              progressDayByActivity[selectedActivity.id] ??
                              "monday"
                            }
                            onChange={(event) =>
                              setProgressDayByActivity((current) => ({
                                ...current,
                                [selectedActivity.id]: event.target
                                  .value as ActivityDay,
                              }))
                            }
                          >
                            {DAY_OPTIONS.map((dayOption) => (
                              <option
                                key={dayOption.value}
                                value={dayOption.value}
                              >
                                {dayOption.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            onClick={() =>
                              progressMutation.mutate({
                                activityId: selectedActivity.id,
                                metricType: selectedActivity.metric_type,
                                day:
                                  progressDayByActivity[selectedActivity.id] ??
                                  "monday",
                              })
                            }
                            disabled={progressMutation.isPending}
                          >
                            Marcar progresso
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Nenhuma atividade cadastrada para esta semana.
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card ref={activityFormCardRef}>
            <CardHeader>
              <CardTitle>
                {editingActivityId
                  ? "Editar atividade"
                  : "Criar atividade da semana"}
              </CardTitle>
              <CardDescription>
                Defina métrica e meta para acompanhar o progresso da semana
                selecionada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormProvider {...activityForm}>
                <form
                  className="space-y-4"
                  onSubmit={activityForm.handleSubmit((values) =>
                    activityMutation.mutate(values),
                  )}
                >
                  <ControlledInput
                    name="title"
                    label="Título"
                    placeholder="Ex.: Treinar"
                    disabled={activityMutation.isPending}
                  />

                  <ControlledInput
                    name="description"
                    label="Descrição"
                    placeholder="Ex.: 3x por semana"
                    disabled={activityMutation.isPending}
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="metric-type"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Tipo de métrica
                    </label>
                    <select
                      id="metric-type"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                      value={watchedMetricType}
                      onChange={(event) =>
                        activityForm.setValue(
                          "metric_type",
                          event.target.value as WeeklyActivityMetricType,
                          { shouldValidate: true },
                        )
                      }
                      disabled={activityMutation.isPending}
                    >
                      {metricTypes.map((metricType) => (
                        <option key={metricType} value={metricType}>
                          {getMetricTypeLabel(metricType)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {watchedMetricType === "FREQUENCY" ? (
                    <ControlledInput
                      name="target_frequency"
                      label="Meta de frequência"
                      type="number"
                      min={1}
                      step={1}
                      disabled={activityMutation.isPending}
                    />
                  ) : null}

                  {watchedMetricType === "QUANTITY" ? (
                    <ControlledInput
                      name="target_quantity"
                      label="Meta de quantidade"
                      type="number"
                      min={1}
                      step={1}
                      disabled={activityMutation.isPending}
                    />
                  ) : null}

                  {watchedMetricType === "SPECIFIC_DAYS" ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Dias específicos
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {DAY_OPTIONS.map((dayOption) => (
                          <label
                            key={dayOption.value}
                            className="flex items-center gap-2 text-sm text-foreground"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border border-input"
                              checked={watchedSpecificDays.includes(
                                dayOption.value,
                              )}
                              onChange={() =>
                                handleToggleSpecificDay(dayOption.value)
                              }
                              disabled={activityMutation.isPending}
                            />
                            {dayOption.label}
                          </label>
                        ))}
                      </div>
                      {activityForm.formState.errors.specific_days?.message ? (
                        <p className="text-sm text-destructive">
                          {activityForm.formState.errors.specific_days.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={activityMutation.isPending}>
                      {activityMutation.isPending
                        ? "Salvando..."
                        : editingActivityId
                          ? "Salvar atividade"
                          : "Criar atividade"}
                    </Button>
                    {editingActivityId ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={activityMutation.isPending}
                      >
                        Cancelar edição
                      </Button>
                    ) : null}
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
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
