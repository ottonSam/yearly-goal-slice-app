import * as React from "react";

import {
  BaseMonthCalendar,
  type BaseMonthCalendarDayContext,
} from "@/components/BaseMonthCalendar";
import { cn } from "@/lib/utils";

export interface GoalWeekCalendarWeek {
  id: string;
  week_num: number;
  start_week: string;
  end_week: string;
}

interface GoalWeekCalendarProps {
  startDate: string;
  endDate: string;
  weeks: GoalWeekCalendarWeek[];
  selectedWeekId?: string;
  currentWeekId?: string;
  markedDates?: string[];
  onWeekSelect?: (weekId: string) => void;
  className?: string;
}

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildWeekDateMap(weeks: GoalWeekCalendarWeek[]) {
  const weekDateMap = new Map<string, string>();

  for (const week of weeks) {
    const start = parseIsoDate(week.start_week);
    const end = parseIsoDate(week.end_week);

    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor = addDays(cursor, 1)
    ) {
      weekDateMap.set(formatIsoDate(cursor), week.id);
    }
  }

  return weekDateMap;
}

export function GoalWeekCalendar({
  startDate,
  endDate,
  weeks,
  selectedWeekId,
  currentWeekId,
  markedDates = [],
  onWeekSelect,
  className,
}: GoalWeekCalendarProps) {
  const sortedWeeks = React.useMemo(
    () => [...weeks].sort((a, b) => a.week_num - b.week_num),
    [weeks],
  );
  const selectedWeek = React.useMemo(
    () => sortedWeeks.find((week) => week.id === selectedWeekId),
    [selectedWeekId, sortedWeeks],
  );
  const currentWeek = React.useMemo(
    () => sortedWeeks.find((week) => week.id === currentWeekId),
    [currentWeekId, sortedWeeks],
  );
  const weekDateMap = React.useMemo(
    () => buildWeekDateMap(sortedWeeks),
    [sortedWeeks],
  );
  const weekBoundariesMap = React.useMemo(
    () =>
      new Map(
        sortedWeeks.map((week) => [
          week.id,
          { start: week.start_week, end: week.end_week },
        ]),
      ),
    [sortedWeeks],
  );
  const markedDateSet = React.useMemo(
    () => new Set(markedDates),
    [markedDates],
  );

  const displayedWeek = selectedWeek ?? currentWeek ?? sortedWeeks[0] ?? null;
  const activeWeekId = selectedWeekId || currentWeekId || "";
  const visibleMonthAnchor =
    selectedWeek?.start_week ?? currentWeek?.start_week ?? startDate;

  const getWeekCalendarState = React.useCallback(
    (day: BaseMonthCalendarDayContext) => {
      const weekId = weekDateMap.get(day.iso);
      const isHighlighted = Boolean(activeWeekId && weekId === activeWeekId);
      const weekBoundaries = weekId ? weekBoundariesMap.get(weekId) : undefined;
      const isWeekStart = Boolean(weekBoundaries && weekBoundaries.start === day.iso);
      const isWeekEnd = Boolean(weekBoundaries && weekBoundaries.end === day.iso);
      const isMarked = markedDateSet.has(day.iso);

      return {
        weekId,
        isHighlighted,
        isWeekStart,
        isWeekEnd,
        isMarked,
      };
    },
    [activeWeekId, markedDateSet, weekBoundariesMap, weekDateMap],
  );

  return (
    <BaseMonthCalendar
      startDate={startDate}
      endDate={endDate}
      visibleMonthAnchor={visibleMonthAnchor}
      syncVisibleMonthOnAnchorChange={false}
      className={className}
      subtitle={
        <span className="inline-flex rounded-full bg-(--brand-100) px-3 py-1 text-xs font-semibold tracking-[0.08em] text-(--brand-700)">
          {displayedWeek
            ? `SEMANA ${displayedWeek.week_num} DE ${sortedWeeks.length}`
            : "SEMANA —"}
        </span>
      }
      footer={
        <p className="mt-6 text-center text-xs font-semibold tracking-[0.08em] text-muted-foreground">
          TOQUE EM UM DIA PARA SELECIONAR A SEMANA
        </p>
      }
      onDayClick={(day) => {
        const { weekId } = getWeekCalendarState(day);
        if (weekId && onWeekSelect) {
          onWeekSelect(weekId);
        }
      }}
      isDayDisabled={(day) => {
        const { weekId } = getWeekCalendarState(day);
        return !day.isInRange || !weekId || !onWeekSelect;
      }}
      getDayButtonClassName={(day) => {
        const { isHighlighted, isWeekStart, isWeekEnd } =
          getWeekCalendarState(day);

        return cn(
          isHighlighted && "bg-(--brand-500) text-(--neutral-50)",
          isHighlighted &&
            !isWeekStart &&
            !isWeekEnd &&
            "rounded-none",
          isHighlighted && isWeekStart && "rounded-l-2xl rounded-r-none",
          isHighlighted && isWeekEnd && "rounded-r-2xl rounded-l-none",
          isHighlighted && isWeekStart && isWeekEnd && "rounded-2xl",
        );
      }}
      renderDayContent={(day) => {
        const { isHighlighted, isMarked } = getWeekCalendarState(day);

        return (
          <>
            <span className={cn(isMarked && "pb-2")}>{day.dayNumber}</span>
            {isMarked ? (
              <span
                className={cn(
                  "absolute bottom-2 h-1.5 w-1.5 rounded-full",
                  isHighlighted ? "bg-white" : "bg-(--brand-500)",
                )}
                aria-hidden
              />
            ) : null}
          </>
        );
      }}
    />
  );
}
