import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  completeObjective,
  listObjectivesByGoalCalendar,
  listObjectivesByType,
} from "@/api/objectives";
import { listGoalCalendars } from "@/api/goal-calendars";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { Badge } from "@/components/ui/badge";
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
import { goalCalendarListSchema } from "@/schemas/goal-calendar";
import { objectiveListSchema } from "@/schemas/objective";

type ObjectiveWithMeta = ReturnType<
  typeof objectiveListSchema.parse
>[number] & {
  goalCalendarTitle?: string;
};

function isObjectiveCompleted(objective: ObjectiveWithMeta) {
  return Boolean(objective.is_complete);
}

function objectiveTypeLabel(
  type: "LONG_TERM" | "MEDIUM_TERM" | "GOAL_CALENDAR",
) {
  if (type === "LONG_TERM") {
    return "Longo prazo";
  }
  if (type === "MEDIUM_TERM") {
    return "Médio prazo";
  }
  return "Calendário";
}

export default function ObjectivesHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { data: goalCalendars = [], error: goalCalendarsError } = useQuery({
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

  const { data: longTermObjectives = [], error: longTermError } = useQuery({
    queryKey: userScopedKey(userId, "objectives", "type", "LONG_TERM"),
    queryFn: async () => {
      const data = await listObjectivesByType("LONG_TERM");
      const parsed = objectiveListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  const { data: mediumTermObjectives = [], error: mediumTermError } = useQuery({
    queryKey: userScopedKey(userId, "objectives", "type", "MEDIUM_TERM"),
    queryFn: async () => {
      const data = await listObjectivesByType("MEDIUM_TERM");
      const parsed = objectiveListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  const {
    data: goalCalendarObjectives = [],
    error: goalCalendarObjectivesError,
  } = useQuery({
    queryKey: userScopedKey(userId, "objectives", "goal-calendars"),
    enabled: goalCalendars.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        goalCalendars.map(async (goalCalendar) => {
          const data = await listObjectivesByGoalCalendar(
            String(goalCalendar.id),
          );
          const parsed = objectiveListSchema.safeParse(data);
          if (!parsed.success) {
            throw new Error("Resposta inválida da API.");
          }

          return parsed.data.map((objective) => ({
            ...objective,
            goalCalendarTitle: goalCalendar.title,
          }));
        }),
      );

      return results.flat();
    },
  });

  React.useEffect(() => {
    const firstError =
      goalCalendarsError ??
      longTermError ??
      mediumTermError ??
      goalCalendarObjectivesError;
    if (!firstError) {
      return;
    }

    const apiError =
      firstError instanceof Error &&
      firstError.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: firstError.message }
        : getApiErrorMessage(firstError);

    setDialogStatus("error");
    setDialogTitle("Não foi possível carregar os objetivos");
    setDialogResult(apiError);
    setDialogOpen(true);
  }, [
    goalCalendarsError,
    goalCalendarObjectivesError,
    longTermError,
    mediumTermError,
  ]);

  const completeMutation = useMutation({
    mutationFn: async (objectiveId: string) => completeObjective(objectiveId),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: userScopedKey(userId, "objectives"),
      });

      setDialogStatus("success");
      setDialogTitle("Objetivo concluído");
      setDialogResult({
        statusCode: response.statusCode,
        body: "O objetivo foi marcado como concluído.",
      });
      setDialogOpen(true);
    },
    onError: (error) => {
      setDialogStatus("error");
      setDialogTitle("Não foi possível concluir o objetivo");
      setDialogResult(getApiErrorMessage(error));
      setDialogOpen(true);
    },
  });

  const objectiveGroups: Array<{
    type: "LONG_TERM" | "MEDIUM_TERM" | "GOAL_CALENDAR";
    objectives: ObjectiveWithMeta[];
  }> = [
    { type: "LONG_TERM", objectives: longTermObjectives },
    { type: "MEDIUM_TERM", objectives: mediumTermObjectives },
    { type: "GOAL_CALENDAR", objectives: goalCalendarObjectives },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">Objetivos</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus objetivos por tipo e marque os concluídos.
          </p>
        </div>
        <Button onClick={() => navigate("/objectives/new")}>
          Novo objetivo
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {objectiveGroups.map((group) => (
          <Card key={group.type}>
            <CardHeader>
              <CardTitle>{objectiveTypeLabel(group.type)}</CardTitle>
              <CardDescription>
                {group.objectives.length} objetivo(s) encontrado(s).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.objectives.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum objetivo cadastrado.
                </p>
              ) : (
                (() => {
                  const pendingObjectives = group.objectives.filter(
                    (objective) => !isObjectiveCompleted(objective),
                  );
                  const completedObjectives = group.objectives.filter(
                    (objective) => isObjectiveCompleted(objective),
                  );

                  return (
                    <>
                      {pendingObjectives.length > 0 ? (
                        <>
                          {pendingObjectives.map((objective) => (
                            <div
                              key={String(objective.id)}
                              className="rounded-lg border border-border p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium">{objective.title}</p>
                                <Badge
                                  variant={
                                    objective.is_complete
                                      ? "success"
                                      : "secondary"
                                  }
                                >
                                  {objective.is_complete
                                    ? "Concluído"
                                    : "Pendente"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {objective.description || "Sem descrição."}
                              </p>
                              {group.type === "GOAL_CALENDAR" ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Calendário:{" "}
                                  {objective.goalCalendarTitle ?? "—"}
                                </p>
                              ) : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    navigate(`/objectives/edit/${objective.id}`)
                                  }
                                >
                                  Editar
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() =>
                                    completeMutation.mutate(
                                      String(objective.id),
                                    )
                                  }
                                  disabled={completeMutation.isPending}
                                >
                                  Concluir
                                </Button>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : null}

                      {completedObjectives.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Concluídos
                          </p>
                          {completedObjectives.map((objective) => (
                            <div
                              key={String(objective.id)}
                              className="rounded-lg border border-success/40 bg-success/5 p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-muted-foreground line-through">
                                  {objective.title}
                                </p>
                                <Badge variant="success">Concluído</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {objective.description || "Sem descrição."}
                              </p>
                              {group.type === "GOAL_CALENDAR" ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Calendário:{" "}
                                  {objective.goalCalendarTitle ?? "—"}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  );
                })()
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
