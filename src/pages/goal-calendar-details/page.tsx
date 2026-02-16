import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { getGoalCalendarById } from "@/api/goal-calendars";
import { formatDateLongPtBr } from "@/assets/utils/formatDateLongPtBr";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
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

export default function GoalCalendarDetailsPage() {
  const { goalCalendarId } = useParams<{ goalCalendarId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const [selectedWeekId, setSelectedWeekId] = React.useState<string>("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const {
    data: calendar,
    isLoading,
    error,
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

  React.useEffect(() => {
    if (!error) {
      return;
    }

    const apiResult =
      error instanceof Error && error.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: error.message }
        : getApiErrorMessage(error);

    setDialogResult(apiResult);
    setDialogOpen(true);
  }, [error]);

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

      {isLoading ? (
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
                        Relatório:{" "}
                      </span>
                      {selectedWeek.report ? selectedWeek.report : "Pendente"}
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
            </CardContent>
          </Card>
        </>
      )}

      <HttpRequestResultDialog
        title="Não foi possível carregar os detalhes do calendário"
        isOpen={dialogOpen}
        isSuccess={false}
        statusCode={dialogResult.statusCode}
        message={dialogResult.body}
        closeAction={() => setDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setDialogOpen(false)}
      />
    </div>
  );
}
