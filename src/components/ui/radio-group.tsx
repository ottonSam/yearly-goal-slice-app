import * as React from "react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="radiogroup"
    className={cn("grid gap-2", className)}
    {...props}
  />
))
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, label, id, ...props }, ref) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        ref={ref}
        id={id}
        type="radio"
        className={cn(
          "h-4 w-4 appearance-none rounded-full border border-input bg-background shadow-sm transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  )
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
