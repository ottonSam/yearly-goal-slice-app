import { CreditCard, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WalletCardProps {
  name: string;
  cycleLabel: string;
  monthlyLimitLabel: string;
  totalLimitLabel: string;
  onEdit?: () => void;
}

export function WalletCard({
  name,
  cycleLabel,
  monthlyLimitLabel,
  totalLimitLabel,
  onEdit,
}: WalletCardProps) {
  return (
    <Card className="rounded-3xl border-[var(--brand-200)] bg-[var(--brand-100)]/55 p-5 shadow-none sm:p-7">
      <div className="flex items-start justify-between gap-4 sm:gap-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CreditCard className="h-6 w-6" aria-hidden />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {name}
            </h2>
            <p className="text-sm font-semibold text-primary sm:text-base">
              Ciclo: {cycleLabel}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onEdit}
          className="size-10 text-primary hover:bg-primary/10 hover:text-primary"
          aria-label={`Editar carteira ${name}`}
        >
          <Pencil className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-card/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Limite mensal
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
            {monthlyLimitLabel}
          </p>
        </div>
        <div className="rounded-3xl bg-card/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Limite total
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
            {totalLimitLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}
