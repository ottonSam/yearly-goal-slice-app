import * as React from "react";

import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type WeeklyActivityDay,
  type WeeklyActivityMetricType,
} from "@/schemas/weekly-activity";

export type ActivityProgressPayload =
  | { metricType: "FREQUENCY"; day: WeeklyActivityDay }
  | { metricType: "SPECIFIC_DAYS"; day: WeeklyActivityDay }
  | { metricType: "QUANTITY"; amount: number };

export interface ActivityProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricType: WeeklyActivityMetricType;
  dayOptions: Array<{ value: WeeklyActivityDay; label: string }>;
  onSubmit: (payload: ActivityProgressPayload) => void;
  onCancel: () => void;
  isPending?: boolean;
  trigger?: React.ReactNode;
  actionLabel?: string;
  title?: string;
  description?: string;
}

function getDefaultTitle(metricType: WeeklyActivityMetricType) {
  if (metricType === "QUANTITY") {
    return "Registrar quantidade";
  }

  if (metricType === "SPECIFIC_DAYS") {
    return "Registrar dia específico";
  }

  return "Registrar frequência";
}

function getDefaultDescription(metricType: WeeklyActivityMetricType) {
  if (metricType === "QUANTITY") {
    return "Informe a quantidade realizada nesta atualização.";
  }

  return "Selecione o dia em que a atividade foi concluída.";
}

export function ActivityProgressDialog({
  open,
  onOpenChange,
  metricType,
  dayOptions,
  onSubmit,
  onCancel,
  isPending = false,
  trigger,
  actionLabel = "Registrar progresso",
  title,
  description,
}: ActivityProgressDialogProps) {
  const firstDay = dayOptions[0]?.value;
  const [selectedDay, setSelectedDay] = React.useState<WeeklyActivityDay | "">(
    firstDay ?? "",
  );
  const [amountInput, setAmountInput] = React.useState("1");

  React.useEffect(() => {
    setSelectedDay(dayOptions[0]?.value ?? "");
    setAmountInput("1");
  }, [metricType, dayOptions]);

  const parsedAmount = Number(amountInput);
  const isQuantityMode = metricType === "QUANTITY";
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isSubmitDisabled = isPending || (isQuantityMode ? !isValidAmount : !selectedDay);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (metricType === "QUANTITY") {
      if (!isValidAmount) {
        return;
      }

      onSubmit({
        metricType: "QUANTITY",
        amount: parsedAmount,
      });
      return;
    }

    if (!selectedDay) {
      return;
    }

    onSubmit({
      metricType,
      day: selectedDay,
    });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        trigger ?? (
          <Button type="button" disabled={isPending}>
            {actionLabel}
          </Button>
        )
      }
      title={title ?? getDefaultTitle(metricType)}
      description={description ?? getDefaultDescription(metricType)}
      contentClassName="sm:max-w-[560px] gap-4"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isQuantityMode ? (
          <div className="space-y-2">
            <label
              htmlFor="activity-progress-amount"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Quantidade
            </label>
            <Input
              id="activity-progress-amount"
              type="number"
              min={0.01}
              step={0.01}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              disabled={isPending}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="activity-progress-day"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Dia
            </label>
            <select
              id="activity-progress-day"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={selectedDay}
              onChange={(event) =>
                setSelectedDay(event.target.value as WeeklyActivityDay)
              }
              disabled={isPending || dayOptions.length === 0}
            >
              {dayOptions.map((dayOption) => (
                <option key={dayOption.value} value={dayOption.value}>
                  {dayOption.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isSubmitDisabled}>
            {isPending ? "Registrando..." : actionLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
