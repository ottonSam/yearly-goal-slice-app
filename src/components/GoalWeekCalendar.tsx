import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toMonthTitle(date: Date) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const value = formatter.format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
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

  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    if (selectedWeek) {
      return startOfMonth(parseIsoDate(selectedWeek.start_week));
    }

    return startOfMonth(parseIsoDate(startDate));
  });

  React.useEffect(() => {
    if (!selectedWeek) {
      return;
    }

    setVisibleMonth(startOfMonth(parseIsoDate(selectedWeek.start_week)));
  }, [selectedWeek]);

  const displayedWeek = selectedWeek ?? currentWeek ?? sortedWeeks[0] ?? null;
  const activeWeekId = selectedWeekId || currentWeekId || "";

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const visibleYearMonth =
    visibleMonth.getFullYear() * 12 + visibleMonth.getMonth();
  const lastDateOfLastMonth = React.useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month],
  );
  const firstDayOfMonth = React.useMemo(
    () => new Date(year, month, 1).getDay(),
    [year, month],
  );
  const lastDateOfMonth = React.useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month],
  );
  const lastDayOfMonth = React.useMemo(
    () => new Date(year, month, lastDateOfMonth).getDay(),
    [year, lastDateOfMonth, month],
  );
  const generateDays = React.useCallback(
    (start: number, end: number, monthOffset: number) => {
      const days: Date[] = [];

      for (let day = start; day <= end; day += 1) {
        days.push(new Date(year, month + monthOffset, day));
      }

      return days;
    },
    [year, month],
  );
  const gridDates = React.useMemo(
    () => [
      ...generateDays(
        lastDateOfLastMonth - firstDayOfMonth + 1,
        lastDateOfLastMonth,
        -1,
      ),
      ...generateDays(1, lastDateOfMonth, 0),
      ...generateDays(1, 6 - lastDayOfMonth, 1),
    ],
    [
      firstDayOfMonth,
      generateDays,
      lastDateOfLastMonth,
      lastDateOfMonth,
      lastDayOfMonth,
    ],
  );
  const gridIsoDates = React.useMemo(
    () => gridDates.map((date) => formatIsoDate(date)),
    [gridDates],
  );
  const gridWeekIds = React.useMemo(
    () => gridIsoDates.map((iso) => weekDateMap.get(iso)),
    [gridIsoDates, weekDateMap],
  );
  const gridHighlighted = React.useMemo(
    () =>
      gridWeekIds.map((weekId) =>
        Boolean(activeWeekId && weekId === activeWeekId),
      ),
    [activeWeekId, gridWeekIds],
  );
  const gridInCurrentMonth = React.useMemo(
    () =>
      gridDates.map(
        (date) =>
          date.getFullYear() * 12 + date.getMonth() === visibleYearMonth,
      ),
    [gridDates, visibleYearMonth],
  );
  const gridInRange = React.useMemo(
    () => gridIsoDates.map((iso) => iso >= startDate && iso <= endDate),
    [endDate, gridIsoDates, startDate],
  );

  const handlePreviousMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">
            {toMonthTitle(visibleMonth)}
          </h3>
          <span className="inline-flex rounded-full bg-(--brand-100) px-3 py-1 text-xs font-semibold tracking-[0.08em] text---brand-700)">
            {displayedWeek
              ? `SEMANA ${displayedWeek.week_num} DE ${sortedWeeks.length}`
              : "SEMANA —"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((day) => (
          <span
            key={day}
            className="pb-1 text-center text-xs font-semibold tracking-[0.08em] text-muted-foreground"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {gridIsoDates.map((iso, index) => {
          const weekId = gridWeekIds[index];
          const isInCurrentMonth = gridInCurrentMonth[index];
          const isInRange = gridInRange[index];

          const isHighlighted = gridHighlighted[index];
          const marked = markedDateSet.has(iso);
          const dayLabel = Number(iso.slice(8, 10));
          const isClickable = Boolean(isInRange && weekId && onWeekSelect);
          const weekBoundaries = weekId
            ? weekBoundariesMap.get(weekId)
            : undefined;
          const isWeekStart = Boolean(
            weekBoundaries && weekBoundaries.start === iso,
          );
          const isWeekEnd = Boolean(
            weekBoundaries && weekBoundaries.end === iso,
          );
          const hasPreviousHighlighted = Boolean(!isWeekStart);
          const hasNextHighlighted = Boolean(!isWeekEnd);

          return (
            <button
              key={iso}
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (weekId && onWeekSelect) {
                  onWeekSelect(weekId);
                }
              }}
              className={cn(
                "relative flex h-12 items-center justify-center text-lg font-semibold transition-colors",
                isInCurrentMonth
                  ? "text-foreground"
                  : "text-muted-foreground/70",
                isInRange
                  ? "cursor-pointer"
                  : "cursor-not-allowed text-muted-foreground/40",
                !isHighlighted && isInRange && "hover:bg-muted/60",
                isHighlighted && "bg-(--brand-500) text-(--neutral-50)",
                isHighlighted &&
                  (isWeekStart || !hasPreviousHighlighted) &&
                  "rounded-l-2xl",
                isHighlighted &&
                  (isWeekEnd || !hasNextHighlighted) &&
                  "rounded-r-2xl",
                !isInRange && "opacity-60",
              )}
            >
              <span className={cn(marked && "pb-2")}>{dayLabel}</span>
              {marked ? (
                <span
                  className={cn(
                    "absolute bottom-2 h-1.5 w-1.5 rounded-full",
                    isHighlighted ? "bg-white" : "bg-(--brand-500)",
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs font-semibold tracking-[0.08em] text-muted-foreground">
        TOQUE EM UM DIA PARA SELECIONAR A SEMANA
      </p>
    </div>
  );
}
