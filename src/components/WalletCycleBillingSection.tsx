import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { getWalletCycleBillingSummary } from "@/api/wallets";
import { getExpenseCategoryIconByName } from "@/assets/utils/expenseCategoryIcons";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { formatCurrencyBRL } from "@/assets/utils/money";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userScopedKey } from "@/lib/query-keys";
import {
  walletCycleBillingSummarySchema,
  type WalletCycleBillingSummary,
} from "@/schemas/wallet-cycle";

interface WalletCycleBillingSectionProps {
  expenseCycleId?: string;
  userId?: string | number;
  isCycleLoading?: boolean;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function parseMoney(value?: string | null) {
  const amount = Number(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
}

const chartConfig = {
  spent: {
    label: "Total gasto",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function WalletCycleBillingSection({
  expenseCycleId,
  userId,
  isCycleLoading = false,
}: WalletCycleBillingSectionProps) {
  const [loadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [loadDialogResult, setLoadDialogResult] =
    React.useState<ApiErrorResult>({
      statusCode: undefined,
      body: "",
    });

  const billingSummaryQuery = useQuery({
    queryKey: userScopedKey(
      userId,
      "wallets",
      "cycle",
      "billing-summary",
      expenseCycleId ?? "unknown",
    ),
    enabled: Boolean(expenseCycleId),
    queryFn: async () => {
      const data = await getWalletCycleBillingSummary(expenseCycleId!);
      const parsed = walletCycleBillingSummarySchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  React.useEffect(() => {
    if (!billingSummaryQuery.error) {
      return;
    }

    const apiResult =
      billingSummaryQuery.error instanceof Error &&
      billingSummaryQuery.error.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: billingSummaryQuery.error.message }
        : getApiErrorMessage(billingSummaryQuery.error);

    setLoadDialogResult(apiResult);
    setLoadDialogOpen(true);
  }, [billingSummaryQuery.error]);

  const summary = billingSummaryQuery.data;

  const categoryRows = React.useMemo(() => {
    const totalCycleSpent = parseMoney(summary?.total_cycle_spent);

    return (summary?.spending_by_category ?? []).map((item) => {
      const totalSpent = parseMoney(item.total_spent);
      const ratio =
        totalCycleSpent > 0 ? (totalSpent / totalCycleSpent) * 100 : 0;

      return {
        categoryId: item.category_id,
        categoryName: item.category_name,
        categoryIcon: item.category_icon,
        categoryColor: item.category_color,
        totalSpent,
        totalSpentLabel: item.total_spent,
        ratio,
      };
    });
  }, [summary]);

  const hasCategoryData = categoryRows.length > 0;
  const remainingLimitPerDay = summary?.remaining_limit_per_day;
  const isRemainingPerDayNegative = parseMoney(remainingLimitPerDay) < 0;
  const chartHeight = React.useMemo(() => {
    const rowHeight = 42;
    const verticalPadding = 36;
    const calculatedHeight = categoryRows.length * rowHeight + verticalPadding;

    return Math.min(calculatedHeight);
  }, [categoryRows.length]);

  const renderSummary = (data: WalletCycleBillingSummary) => (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Total gasto no ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrencyBRL(data.total_cycle_spent)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Parcelado no ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrencyBRL(data.total_cycle_installment_spent)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Recorrente no ciclo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrencyBRL(data.total_cycle_recurring_spent)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-card sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Parcelas futuras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrencyBRL(data.total_future_installment_spent)}
            </p>
          </CardContent>
        </Card>

        {remainingLimitPerDay ? (
          <Card
            className={`rounded-2xl border-border/80 bg-card ${
              isRemainingPerDayNegative
                ? "border-destructive/40 bg-destructive/8"
                : ""
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`text-sm font-semibold uppercase tracking-[0.08em] ${
                  isRemainingPerDayNegative
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                Limite restante por dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-semibold ${
                  isRemainingPerDayNegative
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                {formatCurrencyBRL(remainingLimitPerDay)}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {!hasCategoryData ? (
        <Card>
          <CardHeader>
            <CardTitle>Sem categorias na fatura</CardTitle>
            <CardDescription>
              Adicione gastos para visualizar o gráfico e o detalhamento por
              categoria.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
            <CardDescription>
              Distribuição dos gastos acumulados no ciclo atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChartContainer
              config={chartConfig}
              className="w-full"
              style={{ height: chartHeight }}
            >
              <BarChart
                accessibilityLayer
                data={categoryRows}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 12, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="categoryName"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      hideIndicator
                      formatter={(value, _name, item) => {
                        const payload = item.payload as {
                          categoryName: string;
                        };

                        return (
                          <div className="flex w-full min-w-[180px] items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              {payload.categoryName}
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatCurrencyBRL(Number(value))}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey="totalSpent" radius={8} barSize={14}>
                  {categoryRows.map((row) => (
                    <Cell
                      key={row.categoryId}
                      fill={row.categoryColor || "var(--color-spent)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="space-y-2">
              {categoryRows.map((row) => {
                const CategoryIcon = getExpenseCategoryIconByName(
                  row.categoryIcon,
                );

                return (
                  <article
                    key={row.categoryId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${row.categoryColor}1A` }}
                      >
                        <CategoryIcon
                          className="h-5 w-5"
                          style={{ color: row.categoryColor }}
                          aria-hidden
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {row.categoryName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(row.ratio)} da fatura
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatCurrencyBRL(row.totalSpentLabel)}
                    </p>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );

  return (
    <>
      {isCycleLoading || billingSummaryQuery.isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Carregando dados da fatura...
          </CardContent>
        </Card>
      ) : !expenseCycleId ? (
        <Card>
          <CardHeader>
            <CardTitle>Ciclo não encontrado</CardTitle>
            <CardDescription>
              Não foi possível resolver o ciclo para carregar os dados da
              fatura.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : summary ? (
        renderSummary(summary)
      ) : null}

      <HttpRequestResultDialog
        title="Não foi possível carregar a fatura"
        isOpen={loadDialogOpen}
        isSuccess={false}
        statusCode={loadDialogResult.statusCode}
        message={loadDialogResult.body}
        closeAction={() => setLoadDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setLoadDialogOpen(false)}
      />
    </>
  );
}
