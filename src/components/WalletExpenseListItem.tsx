import * as React from "react";
import { Bolt, CalendarCheck, RefreshCcw } from "lucide-react";

import { getExpenseCategoryIconByName } from "@/assets/utils/expenseCategoryIcons";
import { formatCurrencyBRL } from "@/assets/utils/money";
import { Button } from "@/components/ui/button";

type ExpenseType =
  | "single_expense"
  | "recurring_expense"
  | "installment_expense";

interface WalletExpenseListItemProps {
  title: string;
  amount: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  expenseType: ExpenseType;
  installmentLabel?: string;
  onEditSingleExpense?: () => void;
  onCancelRecurringExpense?: () => void;
  isActionPending?: boolean;
}

function getExpenseTypeMeta(type: ExpenseType, installmentLabel?: string) {
  if (type === "recurring_expense") {
    return {
      label: "Recorrente",
      Icon: RefreshCcw,
    };
  }

  if (type === "installment_expense") {
    return {
      label: installmentLabel ?? "Parcelado",
      Icon: CalendarCheck,
    };
  }

  return {
    label: "Pontual",
    Icon: Bolt,
  };
}

export function WalletExpenseListItem({
  title,
  amount,
  categoryName,
  categoryIcon,
  categoryColor = "var(--primary)",
  expenseType,
  installmentLabel,
  onEditSingleExpense,
  onCancelRecurringExpense,
  isActionPending = false,
}: WalletExpenseListItemProps) {
  const CategoryIcon = getExpenseCategoryIconByName(categoryIcon);
  const typeMeta = getExpenseTypeMeta(expenseType, installmentLabel);
  const TypeIcon = typeMeta.Icon;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: categoryColor }}
        aria-hidden
      />

      <div className="flex items-center justify-between gap-4 p-4 pl-6 sm:p-5 sm:pl-7">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${categoryColor}1A` }}
          >
            {React.createElement(CategoryIcon, {
              className: "h-8 w-8",
              style: { color: categoryColor },
              "aria-hidden": true,
            })}
          </div>

          <div className="min-w-0 space-y-2">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {title}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-md bg-muted px-2.5 py-1 font-semibold text-muted-foreground">
                {categoryName}
              </span>

              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: categoryColor }}
              >
                {React.createElement(TypeIcon, {
                  className: "h-3.5 w-3.5",
                  "aria-hidden": true,
                })}
                {typeMeta.label}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-2 text-right">
          <p className="text-base font-semibold text-foreground sm:text-lg">
            {formatCurrencyBRL(amount)}
          </p>

          {expenseType === "single_expense" && onEditSingleExpense ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEditSingleExpense}
              disabled={isActionPending}
            >
              Editar
            </Button>
          ) : null}

          {expenseType === "recurring_expense" && onCancelRecurringExpense ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancelRecurringExpense}
              disabled={isActionPending}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
