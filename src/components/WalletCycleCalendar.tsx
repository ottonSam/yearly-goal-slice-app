import * as React from "react";

import {
  BaseMonthCalendar,
  type BaseMonthCalendarDayContext,
} from "@/components/BaseMonthCalendar";
import { cn } from "@/lib/utils";

interface WalletCycleCalendarProps {
  selectedDate: string;
  cycleStartDate?: string;
  cycleEndDate?: string;
  onDateSelect: (dateIso: string) => void;
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

function formatShortDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function buildDateRangeSet(startDate?: string, endDate?: string) {
  const dates = new Set<string>();

  if (!startDate || !endDate) {
    return dates;
  }

  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    dates.add(formatIsoDate(cursor));
  }

  return dates;
}

export function WalletCycleCalendar({
  selectedDate,
  cycleStartDate,
  cycleEndDate,
  onDateSelect,
  className,
}: WalletCycleCalendarProps) {
  const cycleDateSet = React.useMemo(
    () => buildDateRangeSet(cycleStartDate, cycleEndDate),
    [cycleEndDate, cycleStartDate],
  );

  const subtitle =
    cycleStartDate && cycleEndDate ? (
      <span className="inline-flex rounded-full bg-(--brand-100) px-3 py-1 text-xs font-semibold tracking-[0.08em] text-(--brand-700)">
        CICLO {formatShortDate(cycleStartDate)} - {formatShortDate(cycleEndDate)}
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-[0.08em] text-muted-foreground">
        Selecione um dia para resolver o ciclo
      </span>
    );

  const getDayState = React.useCallback(
    (day: BaseMonthCalendarDayContext) => {
      return {
        isSelected: day.iso === selectedDate,
        isInCycle: cycleDateSet.has(day.iso),
      };
    },
    [cycleDateSet, selectedDate],
  );

  return (
    <BaseMonthCalendar
      visibleMonthAnchor={selectedDate}
      className={className}
      subtitle={subtitle}
      footer={
        <p className="mt-6 text-center text-xs font-semibold tracking-[0.08em] text-muted-foreground">
          TOQUE EM UM DIA PARA ALTERAR O CICLO
        </p>
      }
      onDayClick={(day) => onDateSelect(day.iso)}
      isDayDisabled={() => false}
      getDayButtonClassName={(day) => {
        const { isSelected, isInCycle } = getDayState(day);

        return cn(
          isInCycle && "bg-(--brand-100) text-(--brand-700)",
          isSelected && "bg-(--brand-500) text-(--neutral-50) hover:bg-(--brand-500)",
        );
      }}
    />
  );
}
