import * as React from "react";
import { CheckCircle2, Pencil } from "lucide-react";

import {
  ActivityFormDialog,
  type ActivityFormDialogProps,
} from "@/components/ActivityFormDialog";
import {
  ActivityProgressDialog,
  type ActivityProgressPayload,
} from "@/components/ActivityProgressDialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type WeeklyActivityDay,
  type WeeklyActivityMetricType,
} from "@/schemas/weekly-activity";

interface ActivityCardProps {
  title: string;
  description?: string | null;
  progressValueLabel: string;
  goalLabel: string;
  metricLabel: string;
  progressControls?: React.ReactNode;
  markProgressLabel?: string;
  onMarkProgress?: (payload: ActivityProgressPayload) => void;
  markProgressDisabled?: boolean;
  progressMetricType?: WeeklyActivityMetricType;
  progressDayOptions?: Array<{ value: WeeklyActivityDay; label: string }>;
  progressPending?: boolean;
  onEdit?: () => void;
  editDialogProps?: Omit<ActivityFormDialogProps, "mode" | "trigger">;
  className?: string;
}

export function ActivityCard({
  title,
  description,
  progressValueLabel,
  goalLabel,
  metricLabel,
  markProgressLabel,
  onMarkProgress,
  markProgressDisabled,
  progressMetricType,
  progressDayOptions = [],
  progressPending,
  onEdit,
  editDialogProps,
  className,
}: ActivityCardProps) {
  const [isProgressDialogOpen, setIsProgressDialogOpen] = React.useState(false);
  const progressActionLabel = markProgressLabel ?? "Marcar progresso";

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <header className="flex w-full items-start flex-col">
        <div className="flex flex-1 w-full justify-between gap-4">
          <div className="flex items-center gap-2 my-auto">
            <h3 className="truncate max-w-50 text-lg font-bold text-foreground">
              {title}
            </h3>
            {editDialogProps ? (
              <ActivityFormDialog
                {...editDialogProps}
                mode="edit"
                trigger={
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Editar atividade"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                }
              />
            ) : onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Editar atividade"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <div className="text-right my-auto">
            <p className="text-xl font-bold leading-none text-primary">
              {progressValueLabel}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {description || "Sem descrição."}
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-muted/55 p-4 px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Meta
          </p>
          <p className="text-xs font-semibold text-foreground">{goalLabel}</p>
        </div>
        <div className="rounded-3xl bg-muted/55 p-4 px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Métrica
          </p>
          <p className="text-xs font-semibold text-foreground">{metricLabel}</p>
        </div>
      </div>

      {progressMetricType && onMarkProgress ? (
        <ActivityProgressDialog
          open={isProgressDialogOpen}
          onOpenChange={setIsProgressDialogOpen}
          metricType={progressMetricType}
          dayOptions={progressDayOptions}
          isPending={progressPending}
          onSubmit={(payload) => {
            onMarkProgress(payload);
            setIsProgressDialogOpen(false);
          }}
          onCancel={() => setIsProgressDialogOpen(false)}
          actionLabel={progressActionLabel}
          trigger={
            <Button
              type="button"
              className="mt-4 h-12 w-full rounded-3xl text-sm font-semibold"
              disabled={markProgressDisabled || progressPending}
            >
              <CheckCircle2 className="mr-1 h-5 w-5" aria-hidden />
              {progressActionLabel}
            </Button>
          }
        />
      ) : (
        <Button
          type="button"
          className="mt-4 h-12 w-full rounded-3xl text-sm font-semibold"
          disabled={markProgressDisabled || progressPending}
          onClick={() => {
            if (!progressMetricType || !onMarkProgress) {
              return;
            }

            onMarkProgress(
              progressMetricType === "QUANTITY"
                ? { metricType: "QUANTITY", amount: 1 }
                : { metricType: progressMetricType, day: "monday" },
            );
          }}
        >
          <CheckCircle2 className="mr-1 h-5 w-5" aria-hidden />
          {progressActionLabel}
        </Button>
      )}
    </section>
  );
}
