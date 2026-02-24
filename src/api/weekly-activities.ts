import { api } from "@/api/http"

export type ActivityMetricType = "FREQUENCY" | "QUANTITY" | "SPECIFIC_DAYS"
export type ActivityDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export interface WeeklyActivity {
  id: string
  title: string
  description?: string
  metric_type: ActivityMetricType
  target_frequency?: number | null
  target_quantity?: number | null
  specific_days?: ActivityDay[] | null
  [key: string]: unknown
}

export interface WeeklyActivityPayload {
  title: string
  description?: string
  metric_type: ActivityMetricType
  target_frequency?: number
  target_quantity?: number
  specific_days?: ActivityDay[]
}

export interface WeeklyActivityAiReportPayload {
  reflection: string
}

export async function listActivityMetricTypes() {
  const { data } = await api.get<unknown>("/goal-calendars/activities/metric-types/")
  return data
}

export async function listWeeklyActivities(weekId: string) {
  const { data } = await api.get<WeeklyActivity[]>(
    `/goal-calendars/weeks/${weekId}/activities/`
  )
  return data
}

export async function getWeeklyActivityReport(weekId: string) {
  const { data } = await api.get<unknown>(
    `/goal-calendars/weeks/${weekId}/activities/report/`
  )
  return data
}

export async function createWeeklyActivity(
  weekId: string,
  payload: WeeklyActivityPayload
) {
  const response = await api.post<WeeklyActivity>(
    `/goal-calendars/weeks/${weekId}/activities/`,
    payload
  )
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function updateWeeklyActivity(
  weekId: string,
  activityId: string,
  payload: WeeklyActivityPayload
) {
  const response = await api.put<WeeklyActivity>(
    `/goal-calendars/weeks/${weekId}/activities/${activityId}/`,
    payload
  )
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function progressWeeklyActivityFrequency(
  weekId: string,
  activityId: string,
  day: ActivityDay
) {
  const response = await api.post(
    `/goal-calendars/weeks/${weekId}/activities/${activityId}/progress/frequency/`,
    { day }
  )
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function progressWeeklyActivityQuantity(
  weekId: string,
  activityId: string,
  amount: number
) {
  const response = await api.post(
    `/goal-calendars/weeks/${weekId}/activities/${activityId}/progress/quantity/`,
    { amount }
  )
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function progressWeeklyActivitySpecificDays(
  weekId: string,
  activityId: string,
  day: ActivityDay
) {
  const response = await api.post(
    `/goal-calendars/weeks/${weekId}/activities/${activityId}/progress/specific-days/`,
    { day }
  )
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function exportWeeklyActivityReportWithAi(
  weekId: string,
  payload: WeeklyActivityAiReportPayload
) {
  const response = await api.post<unknown>(
    `/goal-calendars/weeks/${weekId}/activities/report/ai/`,
    payload
  )
  return {
    statusCode: response.status,
    data: response.data,
  }
}
