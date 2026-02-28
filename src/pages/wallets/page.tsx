import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { listWallets } from "@/api/wallets";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { formatCurrencyBRL } from "@/assets/utils/money";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { WalletCard } from "@/components/WalletCard";
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
import { walletListSchema } from "@/schemas/wallet";

function formatCycleLabel(cycleStarts: number, cycleEnds: number) {
  const start = String(cycleStarts).padStart(2, "0");
  const end = String(cycleEnds).padStart(2, "0");
  return `Dia ${start} - Dia ${end}`;
}

export default function WalletsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogResult, setDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const {
    data: wallets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: userScopedKey(userId, "wallets"),
    queryFn: async () => {
      const data = await listWallets();
      const parsed = walletListSchema.safeParse(data);
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
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Carteiras
          </h1>
          <Button size="sm" onClick={() => navigate("/wallets/new")}>
            <Plus className="h-4 w-4" aria-hidden />
            Nova carteira
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe suas carteiras e edite os dados de cada uma.
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Carregando carteiras...
          </CardContent>
        </Card>
      ) : wallets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma carteira encontrada</CardTitle>
            <CardDescription>
              Crie sua primeira carteira para acompanhar seus limites.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section className="space-y-4">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              name={wallet.name}
              cycleLabel={formatCycleLabel(wallet.cycle_starts, wallet.cycle_ends)}
              monthlyRemainingLimitLabel={formatCurrencyBRL(
                wallet.remaining_cycle_limit,
              )}
              totalRemainingLimitLabel={formatCurrencyBRL(
                wallet.remaining_total_limit,
              )}
              isDanger={
                wallet.remaining_cycle_limit < 0 || wallet.remaining_total_limit < 0
              }
              onOpenCycle={() => navigate(`/wallets/${wallet.id}/cycle`)}
              onEdit={() => navigate(`/wallets/edit/${wallet.id}`)}
            />
          ))}
        </section>
      )}

      <HttpRequestResultDialog
        title="Não foi possível carregar as carteiras"
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
