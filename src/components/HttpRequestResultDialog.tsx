import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { CodePre, type Json } from "@/components/CodePre";
import { Button } from "@/components/ui/button";
import errorGator from "@/assets/img/errorgator.png";
import successGator from "@/assets/img/sucessgator.png";
import { cn } from "@/lib/utils";

interface HttpRequestResultDialogProps {
  title: string;
  isOpen: boolean;
  isSuccess: boolean;
  statusCode: number | string | undefined;
  message: string | Json;
  closeAction: () => void;
  buttonTitle?: string;
  buttonAction?: () => void;
}

export function HttpRequestResultDialog({
  title,
  isOpen,
  isSuccess,
  statusCode,
  message,
  closeAction,
  buttonTitle,
  buttonAction,
}: HttpRequestResultDialogProps) {
  const hasActionButton = Boolean(buttonTitle && buttonAction);
  const gatorImage = isSuccess ? successGator : errorGator;
  const gatorImageAlt = isSuccess ? "Sucesso" : "Erro";

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeAction();
        }
      }}
      trigger={<button className="hidden" type="button" aria-hidden="true" />}
      title={title}
      footer={
        hasActionButton ? (
          <Button
            variant={isSuccess ? "default" : "destructive"}
            onClick={buttonAction}
          >
            {buttonTitle}
          </Button>
        ) : null
      }
    >
      <div className="space-y-4 pt-4">
        <div
          className={cn(
            "mx-auto flex min-h-36 w-full max-w-56 items-center justify-center rounded-lg border",
            isSuccess
              ? "border-success/30 bg-success/10"
              : "border-destructive/30 bg-destructive/10",
          )}
        >
          <img
            src={gatorImage}
            alt={gatorImageAlt}
            className="h-28 w-28 object-contain"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Status code
          </p>
          <CodePre value={String(statusCode ?? "N/A")} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Message
          </p>
          <CodePre value={message} className="max-h-64" />
        </div>
      </div>
    </ResponsiveDialog>
  );
}
