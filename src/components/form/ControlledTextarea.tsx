import * as React from "react"
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

interface ControlledTextareaProps<TFieldValues extends FieldValues>
  extends Omit<
    React.ComponentProps<typeof Textarea>,
    "name" | "defaultValue" | "value" | "onChange" | "onBlur"
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

export function ControlledTextarea<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  orientation = "vertical",
  fieldClassName,
  contentClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  id,
  ...props
}: ControlledTextareaProps<TFieldValues>) {
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
          {label ? (
            <FieldLabel htmlFor={inputId} className={labelClassName}>
              {label}
            </FieldLabel>
          ) : null}
          <FieldContent className={contentClassName}>
            <Textarea
              {...props}
              {...field}
              id={inputId}
              value={(field.value ?? "") as string}
            />
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
