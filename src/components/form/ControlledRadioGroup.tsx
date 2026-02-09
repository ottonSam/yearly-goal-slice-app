import * as React from "react"
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface RadioOption {
  value: string
  label: string
  id?: string
  disabled?: boolean
}

interface ControlledRadioGroupProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<typeof RadioGroup>, "children"> {
  name: Path<TFieldValues>
  options: RadioOption[]
  label?: string
  description?: string
  orientation?: "vertical" | "horizontal" | "responsive"
  fieldClassName?: string
  contentClassName?: string
  labelClassName?: string
  descriptionClassName?: string
  errorClassName?: string
}

export function ControlledRadioGroup<TFieldValues extends FieldValues>({
  name,
  options,
  label,
  description,
  orientation = "vertical",
  fieldClassName,
  contentClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  ...props
}: ControlledRadioGroupProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()

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
          {label ? <FieldLabel className={labelClassName}>{label}</FieldLabel> : null}
          <FieldContent className={contentClassName}>
            <RadioGroup {...props}>
              {options.map((option) => (
                <RadioGroupItem
                  key={option.value}
                  id={option.id ?? `${String(name)}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  label={option.label}
                  disabled={option.disabled}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                  onBlur={field.onBlur}
                />
              ))}
            </RadioGroup>
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
