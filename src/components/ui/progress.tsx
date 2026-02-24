import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  percentage: number | null | undefined;
}

function clampPercentage(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function Progress({ percentage, className, ...props }: ProgressProps) {
  const normalized = clampPercentage(percentage);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalized)}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full border border-border/60 bg-muted/50",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
