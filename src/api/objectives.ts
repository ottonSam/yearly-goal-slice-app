import { api } from "@/api/http"

export type ObjectiveType = "GOAL_CALENDAR" | "LONG_TERM" | "MEDIUM_TERM"

export interface ObjectivePayload {
  objective_type: ObjectiveType
  title: string
  description: string
  goal_calendar?: string
}

export interface Objective {
  id: string | number
  objective_type: ObjectiveType
  title: string
  description?: string
  goal_calendar?: string | number | null
  completed?: boolean
  is_completed?: boolean
  [key: string]: unknown
}

export async function createObjective(payload: ObjectivePayload) {
  const response = await api.post<Objective>("/objectives/", payload)
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function updateObjective(objectiveId: string, payload: ObjectivePayload) {
  const response = await api.put<Objective>(`/objectives/${objectiveId}/`, payload)
  return {
    statusCode: response.status,
    data: response.data,
  }
}

export async function listObjectivesByType(objectiveType: ObjectiveType) {
  const { data } = await api.get<Objective[]>(`/objectives/type/${objectiveType}/`)
  return data
}

export async function listObjectivesByGoalCalendar(goalCalendarId: string) {
  const { data } = await api.get<Objective[]>(
    `/objectives/goal-calendar/${goalCalendarId}/`
  )
  return data
}

export async function getObjectiveById(objectiveId: string) {
  const { data } = await api.get<Objective>(`/objectives/${objectiveId}/`)
  return data
}

export async function completeObjective(objectiveId: string) {
  const response = await api.post(`/objectives/${objectiveId}/complete/`)
  return {
    statusCode: response.status,
    data: response.data,
  }
}
