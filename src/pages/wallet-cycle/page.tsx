import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { resolveWalletCycle } from "@/api/wallets";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { WalletCycleBillingSection } from "@/components/WalletCycleBillingSection";
import { WalletCycleCalendar } from "@/components/WalletCycleCalendar";
import { WalletCycleExpensesSection } from "@/components/WalletCycleExpensesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/use-auth";
import { userScopedKey } from "@/lib/query-keys";
import { resolveWalletCycleResponseSchema } from "@/schemas/wallet-cycle";

function getCurrentLocalDateIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function WalletCyclePage() {
  const { walletId } = useParams<{ walletId: string }>();
  const { user } = useAuth();
  const userId = user?.id;
  const todayIso = React.useMemo(() => getCurrentLocalDateIso(), []);
  const [selectedDate, setSelectedDate] = React.useState(todayIso);

  const [loadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [loadDialogResult, setLoadDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const cycleQuery = useQuery({
    queryKey: userScopedKey(
      userId,
      "wallets",
      "cycle",
      "resolve",
      walletId ?? "unknown",
      selectedDate,
    ),
    enabled: Boolean(walletId),
    queryFn: async () => {
      const data = await resolveWalletCycle({
        wallet: walletId!,
        date: selectedDate,
      });
      const parsed = resolveWalletCycleResponseSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  React.useEffect(() => {
    if (!cycleQuery.error) {
      return;
    }

    const apiResult =
      cycleQuery.error instanceof Error &&
      cycleQuery.error.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: cycleQuery.error.message }
        : getApiErrorMessage(cycleQuery.error);

    setLoadDialogResult(apiResult);
    setLoadDialogOpen(true);
  }, [cycleQuery.error]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <WalletCycleCalendar
        selectedDate={selectedDate}
        cycleStartDate={cycleQuery.data?.cycle.start_date}
        cycleEndDate={cycleQuery.data?.cycle.end_date}
        onDateSelect={setSelectedDate}
      />

      <Tabs defaultValue="expenses" className="gap-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="billing">Fatura</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <WalletCycleExpensesSection
            walletId={walletId}
            expenseCycleId={cycleQuery.data?.cycle.id}
            userId={userId}
            isCycleLoading={cycleQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="billing">
          <WalletCycleBillingSection
            expenseCycleId={cycleQuery.data?.cycle.id}
            userId={userId}
            isCycleLoading={cycleQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      <HttpRequestResultDialog
        title="Não foi possível carregar o ciclo da carteira"
        isOpen={loadDialogOpen}
        isSuccess={false}
        statusCode={loadDialogResult.statusCode}
        message={loadDialogResult.body}
        closeAction={() => setLoadDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setLoadDialogOpen(false)}
      />
    </div>
  );
}
