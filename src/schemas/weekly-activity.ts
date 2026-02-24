import { z } from "zod";

const activityDaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const metricTypeSchema = z.enum(["FREQUENCY", "QUANTITY", "SPECIFIC_DAYS"]);

export const weeklyActivityFormSchema = z
  .object({
    title: z.string().min(1, "Informe o título da atividade."),
    description: z.string().optional(),
    metric_type: metricTypeSchema,
    target_frequency: z.coerce.number().int().positive().optional(),
    target_quantity: z.coerce.number().positive().optional(),
    specific_days: z.array(activityDaySchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.metric_type === "FREQUENCY" && !data.target_frequency) {
      ctx.addIssue({
        code: "custom",
        path: ["target_frequency"],
        message: "Informe a meta de frequência.",
      });
    }

    if (data.metric_type === "QUANTITY" && !data.target_quantity) {
      ctx.addIssue({
        code: "custom",
        path: ["target_quantity"],
        message: "Informe a meta de quantidade.",
      });
    }

    if (
      data.metric_type === "SPECIFIC_DAYS" &&
      (!data.specific_days || data.specific_days.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["specific_days"],
        message: "Selecione ao menos um dia específico.",
      });
    }
  });

export const weeklyActivitySchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    metric_type: metricTypeSchema,
    target_frequency: z.number().nullable().optional(),
    target_quantity: z.number().nullable().optional(),
    specific_days: z.array(activityDaySchema).nullable().optional(),
    completion_percentage: z.number(),
  })
  .passthrough();

export const weeklyActivityListSchema = z.array(weeklyActivitySchema);

export type WeeklyActivityFormValues = z.infer<typeof weeklyActivityFormSchema>;
export type WeeklyActivityMetricType = z.infer<typeof metricTypeSchema>;
export type WeeklyActivityDay = z.infer<typeof activityDaySchema>;
