import * as React from "react"
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface ControlledCheckboxProps<TFieldValues extends FieldValues>
  extends Omit<
    React.ComponentProps<typeof Checkbox>,
    "name" | "defaultValue" | "checked" | "onCheckedChange" | "onBlur"
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
}

export function ControlledCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  orientation = "horizontal",
  fieldClassName,
  contentClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  id,
  ...props
}: ControlledCheckboxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()
  const inputId = id ?? String(name)

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
          <FieldContent className={contentClassName}>
            <label
              htmlFor={inputId}
              className={cn("flex items-center gap-3 text-sm", labelClassName)}
            >
              <Checkbox
                {...props}
                id={inputId}
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
              {label ? <span>{label}</span> : null}
            </label>
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
