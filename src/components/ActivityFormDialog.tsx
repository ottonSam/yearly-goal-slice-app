import * as React from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";

import { ControlledInput } from "@/components/form/ControlledInput";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import {
  type WeeklyActivityDay,
  type WeeklyActivityFormValues,
  type WeeklyActivityMetricType,
} from "@/schemas/weekly-activity";

export interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  form: UseFormReturn<WeeklyActivityFormValues>;
  metricTypes: WeeklyActivityMetricType[];
  dayOptions: Array<{ value: WeeklyActivityDay; label: string }>;
  isPending?: boolean;
  onSubmit: (values: WeeklyActivityFormValues) => void;
  onCancel: () => void;
  onStartCreate?: () => void;
  trigger?: React.ReactNode;
  getMetricTypeLabel: (metricType: WeeklyActivityMetricType) => string;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  metricTypes,
  dayOptions,
  isPending = false,
  onSubmit,
  onCancel,
  onStartCreate,
  trigger,
  getMetricTypeLabel,
}: ActivityFormDialogProps) {
  const watchedMetricType = form.watch("metric_type");
  const watchedSpecificDays = form.watch("specific_days") ?? [];
  const isEditing = mode === "edit";

  const handleToggleSpecificDay = React.useCallback(
    (day: WeeklyActivityDay) => {
      const currentDays = form.getValues("specific_days") ?? [];
      const nextDays = currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day];

      form.setValue("specific_days", nextDays, { shouldValidate: true });
    },
    [form],
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        trigger ?? (
        <Button type="button" onClick={onStartCreate}>
          Criar atividade
        </Button>
        )
      }
      title={isEditing ? "Editar atividade" : "Criar atividade da semana"}
      description=""
      contentClassName="sm:max-w-[640px] gap-4"
    >
      <FormProvider {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
        >
          <ControlledInput
            name="title"
            label="Título"
            placeholder="Ex.: Treinar"
            disabled={isPending}
          />

          <ControlledInput
            name="description"
            label="Descrição"
            placeholder="Ex.: 3x por semana"
            disabled={isPending}
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
                form.setValue(
                  "metric_type",
                  event.target.value as WeeklyActivityMetricType,
                  { shouldValidate: true },
                )
              }
              disabled={isPending}
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
              disabled={isPending}
            />
          ) : null}

          {watchedMetricType === "QUANTITY" ? (
            <ControlledInput
              name="target_quantity"
              label="Meta de quantidade"
              type="number"
              min={1}
              step={1}
              disabled={isPending}
            />
          ) : null}

          {watchedMetricType === "SPECIFIC_DAYS" ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Dias específicos
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {dayOptions.map((dayOption) => (
                  <label
                    key={dayOption.value}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-input"
                      checked={watchedSpecificDays.includes(dayOption.value)}
                      onChange={() => handleToggleSpecificDay(dayOption.value)}
                      disabled={isPending}
                    />
                    {dayOption.label}
                  </label>
                ))}
              </div>
              {form.formState.errors.specific_days?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.specific_days.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : isEditing
                  ? "Salvar atividade"
                  : "Criar atividade"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              {isEditing ? "Cancelar edição" : "Fechar"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}
