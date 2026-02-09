import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const fieldVariants = cva("group/field grid gap-2", {
  variants: {
    orientation: {
      vertical: "grid gap-2",
      horizontal: "grid gap-3 sm:grid-cols-[180px_1fr] sm:items-start",
      responsive:
        "grid gap-3 @md/field-group:grid-cols-[180px_1fr] @md/field-group:items-start",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof fieldVariants>
>(({ className, orientation, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn(fieldVariants({ orientation }), className)}
    {...props}
  />
))
Field.displayName = "Field"

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.HTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset ref={ref} className={cn("space-y-4", className)} {...props} />
))
FieldSet.displayName = "FieldSet"

const fieldLegendVariants = cva("text-foreground", {
  variants: {
    variant: {
      legend: "text-base font-semibold",
      label: "text-sm font-medium leading-none",
    },
  },
  defaultVariants: {
    variant: "legend",
  },
})

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & VariantProps<typeof fieldLegendVariants>
>(({ className, variant, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn(fieldLegendVariants({ variant }), className)}
    {...props}
  />
))
FieldLegend.displayName = "FieldLegend"

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("@container/field-group flex flex-col gap-6", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
))
FieldContent.displayName = "FieldContent"

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? "span" : "label"

    return (
      <Comp
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none text-foreground group-data-[invalid]/field:text-destructive",
          className
        )}
        {...props}
      />
    )
  }
)
FieldLabel.displayName = "FieldLabel"

const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-foreground group-data-[invalid]/field:text-destructive",
      className
    )}
    {...props}
  />
))
FieldTitle.displayName = "FieldTitle"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground text-balance group-data-[invalid]/field:text-destructive/80",
      className
    )}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const hasContent = Boolean(children)

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 text-xs uppercase tracking-[0.2em]", className)}
      {...props}
    >
      <div className="h-px flex-1 bg-border" />
      {hasContent ? (
        <span className="text-muted-foreground">{children}</span>
      ) : null}
      {hasContent ? <div className="h-px flex-1 bg-border" /> : null}
    </div>
  )
})
FieldSeparator.displayName = "FieldSeparator"

type FieldErrorObject = { message?: string } | undefined

interface FieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  errors?: FieldErrorObject[] | undefined
  issues?: FieldErrorObject[] | undefined
}

const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, errors, issues, children, ...props }, ref) => {
    const list = errors ?? issues
    const messages =
      list?.map((item) => item?.message).filter(Boolean) ?? undefined

    if (messages && messages.length > 1) {
      return (
        <div
          ref={ref}
          className={cn("text-sm text-destructive", className)}
          {...props}
        >
          <ul className="list-disc space-y-1 pl-4">
            {messages.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      )
    }

    const content =
      messages && messages.length === 1 ? messages[0] : children

    if (!content) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {content}
      </div>
    )
  }
)
FieldError.displayName = "FieldError"

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
