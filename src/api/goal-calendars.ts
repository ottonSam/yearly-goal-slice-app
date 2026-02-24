import { api } from "@/api/http";

export interface GoalCalendarPayload {
  title: string;
  num_weeks: number;
  start_date: string;
}

export interface GoalCalendarWeek {
  id: string;
  week_num: number;
  start_week: string;
  end_week: string;
  report: unknown;
  active: boolean;
  created_at: string;
  updated_at: string;
  average_completion_percentage: number;
}

export interface GoalCalendar extends GoalCalendarPayload {
  id?: string | number;
  user?: string;
  end_date?: string;
  start_weekday?: string;
  end_weekday?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  weeks?: GoalCalendarWeek[];
  [key: string]: unknown;
}

export async function listGoalCalendars() {
  const { data } = await api.get<GoalCalendar[]>("/goal-calendars/");
  return data;
}

export async function createGoalCalendar(payload: GoalCalendarPayload) {
  const response = await api.post<GoalCalendar>("/goal-calendars/", payload);
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function updateGoalCalendar(
  goalCalendarId: string,
  payload: GoalCalendarPayload,
) {
  const response = await api.put<GoalCalendar>(
    `/goal-calendars/${goalCalendarId}/`,
    payload,
  );
  return {
    statusCode: response.status,
    data: response.data,
  };
}

export async function getGoalCalendarById(goalCalendarId: string) {
  const { data } = await api.get<GoalCalendar>(
    `/goal-calendars/${goalCalendarId}/`,
  );
  return data;
}
