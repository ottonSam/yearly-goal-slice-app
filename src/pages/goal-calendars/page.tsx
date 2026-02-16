import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { listGoalCalendars } from "@/api/goal-calendars";
import { formatDateLongPtBr } from "@/assets/utils/formatDateLongPtBr";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { Badge } from "@/components/ui/badge";
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
import { goalCalendarListSchema } from "@/schemas/goal-calendar";

export default function GoalCalendarsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const {
    data: calendars = [],
    isLoading,
    error,
  } = useQuery({
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold">Calendários</h1>
          <p className="text-sm text-muted-foreground">
            Visualize seus calendários e acesse os detalhes das semanas.
          </p>
        </div>
        <Button onClick={() => navigate("/goal-calendars/new")}>
          Novo calendário
        </Button>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Carregando calendários...
          </CardContent>
        </Card>
      ) : calendars.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum calendário encontrado</CardTitle>
            <CardDescription>
              Crie seu primeiro calendário para começar o planejamento.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/goal-calendars/new")}>
              Criar calendário
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4">
          {calendars.map((calendar) => (
            <Card key={String(calendar.id)}>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{calendar.title}</CardTitle>
                  <Badge variant={calendar.active ? "success" : "secondary"}>
                    {calendar.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>
                  {formatDateLongPtBr(calendar.start_date)}{" "}
                  {calendar.end_date
                    ? `/ ${formatDateLongPtBr(calendar.end_date)}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Semanas: </span>
                  {calendar.num_weeks}
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/goal-calendars/${calendar.id}`)}
                >
                  Ver detalhes
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/goal-calendars/edit/${calendar.id}`)
                  }
                >
                  Editar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <HttpRequestResultDialog
        title="Não foi possível carregar os calendários"
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
