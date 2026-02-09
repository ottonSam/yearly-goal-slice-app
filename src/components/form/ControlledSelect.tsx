import * as React from "react"
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Select } from "@/components/ui/select"

interface ControlledSelectProps<TFieldValues extends FieldValues>
  extends Omit<
    React.ComponentProps<typeof Select>,
    "name" | "defaultValue" | "value" | "onValueChange" | "children"
  > {
  name: Path<TFieldValues>
  label?: string
  description?: string
  orientation?: "vertical" | "horizontal" | "responsive"
  fieldClassName?: string
  contentClassName?: string
  labelClassName?: string
  descriptionClassName?: string
  errorClassName?: string
  triggerId?: string
  children:
    | React.ReactNode
    | ((options: { triggerId: string }) => React.ReactNode)
}

export function ControlledSelect<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  orientation = "vertical",
  fieldClassName,
  contentClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  triggerId,
  children,
  ...props
}: ControlledSelectProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()
  const resolvedTriggerId = triggerId ?? String(name)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          orientation={orientation}
          className={fieldClassName}
          data-invalid={fieldState.error ? "" : undefined}
        >
          {label ? (
            <FieldLabel htmlFor={resolvedTriggerId} className={labelClassName}>
              {label}
            </FieldLabel>
          ) : null}
          <FieldContent className={contentClassName}>
            <Select
              {...props}
              value={(field.value ?? "") as string}
              onValueChange={field.onChange}
            >
              {typeof children === "function"
                ? children({ triggerId: resolvedTriggerId })
                : children}
            </Select>
            {description ? (
              <FieldDescription className={descriptionClassName}>
                {description}
              </FieldDescription>
            ) : null}
            {fieldState.error?.message ? (
              <FieldError className={errorClassName}>
                {fieldState.error.message}
              </FieldError>
            ) : null}
          </FieldContent>
        </Field>
      )}
    />
  )
}
