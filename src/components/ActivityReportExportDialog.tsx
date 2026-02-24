import * as React from "react";
import { useMutation } from "@tanstack/react-query";

import { exportWeeklyActivityReportWithAi } from "@/api/weekly-activities";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ActivityReportExportDialogProps {
  weekId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  defaultReflection?: string;
  title?: string;
  description?: string;
  onSuccess?: (result: { statusCode: number; data: unknown }) => void;
  onError?: (error: ApiErrorResult) => void;
}

export function ActivityReportExportDialog({
  weekId,
  open,
  onOpenChange,
  trigger,
  defaultReflection = "",
  title = "Exportar relatório com IA",
  description = "Descreva sua reflexão da semana para gerar a exportação do relatório.",
  onSuccess,
  onError,
}: ActivityReportExportDialogProps) {
  const [reflection, setReflection] = React.useState(defaultReflection);
  const [submitError, setSubmitError] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      setReflection(defaultReflection);
      setSubmitError("");
    }
  }, [defaultReflection, open]);

  const exportMutation = useMutation({
    mutationFn: async (payload: { reflection: string }) =>
      exportWeeklyActivityReportWithAi(weekId, payload),
    onSuccess: (result) => {
      onSuccess?.(result);
      onOpenChange(false);
    },
    onError: (error) => {
      const parsed = getApiErrorMessage(error);
      setSubmitError(
        typeof parsed.body === "string"
          ? parsed.body
          : "Não foi possível exportar o relatório.",
      );
      onError?.(parsed);
    },
  });

  const trimmedReflection = reflection.trim();
  const isSubmitDisabled =
    exportMutation.isPending || !weekId || trimmedReflection.length === 0;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        trigger ?? (
          <Button type="button" disabled={!weekId}>
            Exportar relatório
          </Button>
        )
      }
      title={title}
      description={description}
      contentClassName="sm:max-w-[640px] gap-4"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isSubmitDisabled) {
            return;
          }

          setSubmitError("");
          exportMutation.mutate({ reflection: trimmedReflection });
        }}
      >
        <div className="space-y-2">
          <label
            htmlFor="activity-report-reflection"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Reflexão
          </label>
          <Textarea
            id="activity-report-reflection"
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="Me senti bem produtivo, mas tive dificuldade em manter consistência no meio da semana..."
            className="min-h-32 resize-y"
            disabled={exportMutation.isPending}
          />
        </div>

        {submitError ? (
          <p className="text-sm text-destructive">{submitError}</p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isSubmitDisabled}>
            {exportMutation.isPending ? "Exportando..." : "Exportar relatório"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={exportMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
