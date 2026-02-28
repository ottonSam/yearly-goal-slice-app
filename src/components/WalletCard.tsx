import type { KeyboardEvent } from "react";
import { CreditCard, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  name: string;
  cycleLabel: string;
  monthlyRemainingLimitLabel: string;
  totalRemainingLimitLabel: string;
  isDanger?: boolean;
  onOpenCycle?: () => void;
  onEdit?: () => void;
}

export function WalletCard({
  name,
  cycleLabel,
  monthlyRemainingLimitLabel,
  totalRemainingLimitLabel,
  isDanger = false,
  onOpenCycle,
  onEdit,
}: WalletCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onOpenCycle) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenCycle();
    }
  };

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/80 bg-card p-5 shadow-sm transition-colors hover:bg-accent/35 sm:p-7",
        isDanger && "border-destructive/40 bg-destructive/8 hover:bg-destructive/12",
      )}
      role={onOpenCycle ? "button" : undefined}
      tabIndex={onOpenCycle ? 0 : undefined}
      onClick={onOpenCycle}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-4 sm:gap-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className={cn(
              "flex size-20 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card",
              isDanger && "border-destructive/40 bg-destructive/10",
            )}
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary",
                isDanger && "bg-destructive/20 text-destructive",
              )}
            >
              <CreditCard className="h-6 w-6" aria-hidden />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {name}
            </h2>
            <p
              className={cn(
                "text-sm font-semibold text-primary sm:text-base",
                isDanger && "text-destructive",
              )}
            >
              Ciclo: {cycleLabel}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
          className={cn(
            "h-12 w-12 p-3 text-primary hover:bg-primary/10 hover:text-primary",
            isDanger && "text-destructive hover:bg-destructive/15 hover:text-destructive",
          )}
          aria-label={`Editar carteira ${name}`}
        >
          <Pencil className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div
          className={cn(
            "rounded-3xl bg-muted/65 p-5",
            isDanger && "bg-destructive/10",
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.14em] text-primary",
              isDanger && "text-destructive",
            )}
          >
            Limite mensal restante
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-semibold text-foreground sm:text-2xl",
              isDanger && "text-destructive",
            )}
          >
            {monthlyRemainingLimitLabel}
          </p>
        </div>
        <div
          className={cn(
            "rounded-3xl bg-muted/65 p-5",
            isDanger && "bg-destructive/10",
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.14em] text-primary",
              isDanger && "text-destructive",
            )}
          >
            Limite total restante
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-semibold text-foreground sm:text-2xl",
              isDanger && "text-destructive",
            )}
          >
            {totalRemainingLimitLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}
