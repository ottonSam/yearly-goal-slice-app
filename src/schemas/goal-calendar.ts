import { z } from "zod";

export const goalCalendarFormSchema = z.object({
  title: z.string().min(1, "Informe o título."),
  num_weeks: z.coerce
    .number()
    .int("Informe um número inteiro de semanas.")
    .min(1, "Informe ao menos 1 semana.")
    .max(53, "Informe no máximo 53 semanas."),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
});

export const goalCalendarResponseSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string(),
    num_weeks: z.number(),
    start_date: z.string(),
  })
  .passthrough();

export const goalCalendarWeekSchema = z
  .object({
    id: z.string(),
    week_num: z.number(),
    start_week: z.string(),
    end_week: z.string(),
    report: z.string().nullable(),
    active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    average_completion_percentage: z.number(),
  })
  .passthrough();

export const goalCalendarListItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    title: z.string(),
    num_weeks: z.number(),
    start_date: z.string(),
    end_date: z.string().optional(),
    active: z.boolean().optional(),
    weeks: z.array(goalCalendarWeekSchema).optional(),
  })
  .passthrough();

export const goalCalendarListSchema = z.array(goalCalendarListItemSchema);

export const goalCalendarDetailsSchema = goalCalendarListItemSchema.extend({
  weeks: z.array(goalCalendarWeekSchema),
});

export type GoalCalendarFormValues = z.infer<typeof goalCalendarFormSchema>;
