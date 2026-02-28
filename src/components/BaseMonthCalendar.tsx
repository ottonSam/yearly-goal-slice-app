import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export interface BaseMonthCalendarDayContext {
  date: Date;
  iso: string;
  dayNumber: number;
  isInCurrentMonth: boolean;
  isInRange: boolean;
}

interface BaseMonthCalendarProps {
  startDate?: string;
  endDate?: string;
  visibleMonthAnchor?: string;
  syncVisibleMonthOnAnchorChange?: boolean;
  className?: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  onDayClick?: (day: BaseMonthCalendarDayContext) => void;
  isDayDisabled?: (day: BaseMonthCalendarDayContext) => boolean;
  getDayButtonClassName?: (day: BaseMonthCalendarDayContext) => string;
  renderDayContent?: (day: BaseMonthCalendarDayContext) => React.ReactNode;
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

export function BaseMonthCalendar({
  startDate,
  endDate,
  visibleMonthAnchor,
  syncVisibleMonthOnAnchorChange = true,
  className,
  subtitle,
  footer,
  onDayClick,
  isDayDisabled,
  getDayButtonClassName,
  renderDayContent,
}: BaseMonthCalendarProps) {
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    if (visibleMonthAnchor) {
      return startOfMonth(parseIsoDate(visibleMonthAnchor));
    }

    return startOfMonth(new Date());
  });

  React.useEffect(() => {
    if (!syncVisibleMonthOnAnchorChange || !visibleMonthAnchor) {
      return;
    }

    setVisibleMonth(startOfMonth(parseIsoDate(visibleMonthAnchor)));
  }, [syncVisibleMonthOnAnchorChange, visibleMonthAnchor]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const visibleYearMonth = year * 12 + month;
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
  const days = React.useMemo(
    () =>
      gridDates.map((date) => {
        const iso = formatIsoDate(date);
        const inRangeStart = !startDate || iso >= startDate;
        const inRangeEnd = !endDate || iso <= endDate;

        return {
          date,
          iso,
          dayNumber: date.getDate(),
          isInCurrentMonth:
            date.getFullYear() * 12 + date.getMonth() === visibleYearMonth,
          isInRange: inRangeStart && inRangeEnd,
        };
      }),
    [endDate, gridDates, startDate, visibleYearMonth],
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
          {subtitle ? subtitle : null}
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
        {days.map((day) => {
          const disabled = isDayDisabled
            ? isDayDisabled(day)
            : !day.isInRange || !onDayClick;

          return (
            <button
              key={day.iso}
              type="button"
              disabled={disabled}
              onClick={() => onDayClick?.(day)}
              className={cn(
                "relative flex h-12 items-center justify-center text-lg font-semibold transition-colors",
                "rounded-xl",
                day.isInCurrentMonth
                  ? "text-foreground"
                  : "text-muted-foreground/70",
                !disabled && "cursor-pointer hover:bg-muted/60",
                disabled && "cursor-not-allowed opacity-60",
                !day.isInRange && "text-muted-foreground/40",
                getDayButtonClassName?.(day),
              )}
            >
              {renderDayContent ? renderDayContent(day) : <span>{day.dayNumber}</span>}
            </button>
          );
        })}
      </div>

      {footer ? footer : null}
    </div>
  );
}
