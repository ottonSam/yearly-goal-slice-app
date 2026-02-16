import { z } from "zod"

export const objectiveTypeSchema = z.enum([
  "GOAL_CALENDAR",
  "LONG_TERM",
  "MEDIUM_TERM",
])

export const objectiveSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    objective_type: objectiveTypeSchema,
    goal_calendar: z.union([z.string(), z.number()]).nullable().optional(),
    title: z.string(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    is_completed: z.boolean().optional(),
  })
  .passthrough()

export const objectiveListSchema = z.array(objectiveSchema)

export const objectiveFormSchema = z
  .object({
    objective_type: objectiveTypeSchema,
    goal_calendar: z.string().optional(),
    title: z.string().min(1, "Informe o título."),
    description: z.string().min(1, "Informe a descrição."),
  })
  .superRefine((data, ctx) => {
    if (data.objective_type === "GOAL_CALENDAR" && !data.goal_calendar) {
      ctx.addIssue({
        code: "custom",
        path: ["goal_calendar"],
        message: "Selecione um calendário.",
      })
    }
  })

export type ObjectiveType = z.infer<typeof objectiveTypeSchema>
export type ObjectiveFormValues = z.infer<typeof objectiveFormSchema>
