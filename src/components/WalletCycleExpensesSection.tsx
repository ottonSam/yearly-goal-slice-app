import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import {
  cancelRecurringWalletExpense,
  listWalletExpenseCategories,
  listWalletExpensesByCycle,
  updateSingleWalletExpense,
} from "@/api/wallets";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { normalizeMoneyInput } from "@/assets/utils/money";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { WalletExpenseListItem } from "@/components/WalletExpenseListItem";
import { WalletNewExpenseAction } from "@/components/WalletNewExpenseAction";
import { ControlledInput } from "@/components/form/ControlledInput";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userScopedKey } from "@/lib/query-keys";
import {
  walletExpenseCategoryListSchema,
  walletSingleExpenseEditFormSchema,
  type WalletSingleExpenseEditFormValues,
} from "@/schemas/wallet-expense";
import { type WalletExpense, walletExpenseListSchema } from "@/schemas/wallet-cycle";

interface WalletCycleExpensesSectionProps {
  walletId?: string;
  expenseCycleId?: string;
  userId?: string | number;
  isCycleLoading?: boolean;
}

function getCurrentLocalDateIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayIso(todayIso: string) {
  const [year, month, day] = todayIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatExpenseDateGroupLabel(dateIso: string, todayIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  const dayAndMonth = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  })
    .format(date)
    .toUpperCase();

  if (dateIso === todayIso) {
    return `HOJE, ${dayAndMonth}`;
  }

  if (dateIso === getYesterdayIso(todayIso)) {
    return `ONTEM, ${dayAndMonth}`;
  }

  return dayAndMonth;
}

function resolveExpenseCategoryInfo(
  expense: WalletExpense,
  categoriesById: Map<
    string,
    {
      name: string;
      icon: string;
      color: string;
    }
  >,
) {
  if (typeof expense.expense_category === "string") {
    return (
      categoriesById.get(expense.expense_category) ?? {
        name: "Sem categoria",
        icon: "mdi:cart",
        color: "#8B95A7",
      }
    );
  }

  return {
    name: expense.expense_category.name,
    icon: expense.expense_category.icon,
    color: expense.expense_category.color || "#8B95A7",
  };
}

function getExpenseCategoryId(expense: WalletExpense) {
  return typeof expense.expense_category === "string"
    ? expense.expense_category
    : expense.expense_category.id;
}

function getInstallmentLabel(expense: WalletExpense) {
  if (expense.type !== "installment_expense") {
    return undefined;
  }

  if (
    typeof expense.installment_number === "number" &&
    typeof expense.installments_count === "number"
  ) {
    return `Parcela ${String(expense.installment_number).padStart(2, "0")}/${String(
      expense.installments_count,
    ).padStart(2, "0")}`;
  }

  return "Parcelado";
}

export function WalletCycleExpensesSection({
  walletId,
  expenseCycleId,
  userId,
  isCycleLoading = false,
}: WalletCycleExpensesSectionProps) {
  const queryClient = useQueryClient();
  const todayIso = React.useMemo(() => getCurrentLocalDateIso(), []);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingSingleExpenseId, setEditingSingleExpenseId] = React.useState<
    string | null
  >(null);
  const [pendingCancelExpenseId, setPendingCancelExpenseId] = React.useState<
    string | null
  >(null);

  const [loadDialogOpen, setLoadDialogOpen] = React.useState(false);
  const [loadDialogResult, setLoadDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });
  const [actionDialogOpen, setActionDialogOpen] = React.useState(false);
  const [actionDialogStatus, setActionDialogStatus] = React.useState<
    "success" | "error"
  >("success");
  const [actionDialogTitle, setActionDialogTitle] = React.useState("");
  const [actionDialogResult, setActionDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const singleExpenseForm = useForm<WalletSingleExpenseEditFormValues>({
    resolver: zodResolver(walletSingleExpenseEditFormSchema),
    defaultValues: {
      expense_category: "",
      description: "",
      amount: "",
      date: "",
    },
  });
  const watchedSingleExpenseCategory = useWatch({
    control: singleExpenseForm.control,
    name: "expense_category",
  });

  const expensesQuery = useQuery({
    queryKey: userScopedKey(
      userId,
      "wallets",
      "cycle",
      "expenses",
      expenseCycleId ?? "unknown",
    ),
    enabled: Boolean(expenseCycleId),
    queryFn: async () => {
      const data = await listWalletExpensesByCycle(expenseCycleId!);
      const parsed = walletExpenseListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      return parsed.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: userScopedKey(userId, "wallets", "categories"),
    queryFn: async () => {
      const data = await listWalletExpenseCategories();
      const parsed = walletExpenseCategoryListSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }

      return parsed.data;
    },
  });

  const editSingleExpenseMutation = useMutation({
    mutationFn: async (values: WalletSingleExpenseEditFormValues) => {
      if (!editingSingleExpenseId) {
        throw new Error("Despesa não selecionada para edição.");
      }

      return updateSingleWalletExpense(editingSingleExpenseId, {
        expense_category: values.expense_category,
        description: values.description,
        amount: normalizeMoneyInput(values.amount),
        date: values.date,
      });
    },
    onSuccess: async (response) => {
      setIsEditDialogOpen(false);
      setEditingSingleExpenseId(null);
      await queryClient.invalidateQueries({
        queryKey: userScopedKey(userId, "wallets", "cycle", "expenses"),
      });

      setActionDialogStatus("success");
      setActionDialogTitle("Despesa atualizada");
      setActionDialogResult({
        statusCode: response.statusCode,
        body: "A despesa pontual foi atualizada com sucesso.",
      });
      setActionDialogOpen(true);
    },
    onError: (error) => {
      setActionDialogStatus("error");
      setActionDialogTitle("Não foi possível atualizar a despesa");
      setActionDialogResult(getApiErrorMessage(error));
      setActionDialogOpen(true);
    },
  });

  const cancelRecurringMutation = useMutation({
    mutationFn: async (recurringExpenseId: string) =>
      cancelRecurringWalletExpense(recurringExpenseId),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: userScopedKey(userId, "wallets", "cycle", "expenses"),
      });

      setActionDialogStatus("success");
      setActionDialogTitle("Recorrência cancelada");
      setActionDialogResult({
        statusCode: response.statusCode,
        body: "A recorrência da despesa foi cancelada com sucesso.",
      });
      setActionDialogOpen(true);
    },
    onError: (error) => {
      setActionDialogStatus("error");
      setActionDialogTitle("Não foi possível cancelar a recorrência");
      setActionDialogResult(getApiErrorMessage(error));
      setActionDialogOpen(true);
    },
    onSettled: () => {
      setPendingCancelExpenseId(null);
    },
  });

  const expenseGroups = React.useMemo(() => {
    const categoriesById = new Map(
      (categoriesQuery.data ?? []).map((category) => [
        category.id,
        {
          name: category.name,
          icon: category.icon,
          color: category.color,
        },
      ]),
    );

    const grouped = new Map<
      string,
      Array<{
        id: string;
        title: string;
        amount: string;
        categoryName: string;
        categoryIcon: string;
        categoryColor: string;
        expenseType:
          | "single_expense"
          | "recurring_expense"
          | "installment_expense";
        installmentLabel?: string;
        expenseCategoryId: string;
        date: string;
      }>
    >();

    const expenses = [...(expensesQuery.data ?? [])].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.created_at.localeCompare(a.created_at);
    });

    expenses.forEach((expense) => {
      const categoryInfo = resolveExpenseCategoryInfo(expense, categoriesById);
      const expenseDateKey = expense.date;
      const list = grouped.get(expenseDateKey) ?? [];

      list.push({
        id: expense.id,
        title: expense.description,
        amount: expense.amount,
        categoryName: categoryInfo.name,
        categoryIcon: categoryInfo.icon,
        categoryColor: categoryInfo.color,
        expenseType:
          expense.type === "recurring_expense" ||
          expense.type === "installment_expense"
            ? expense.type
            : "single_expense",
        installmentLabel: getInstallmentLabel(expense),
        expenseCategoryId: getExpenseCategoryId(expense),
        date: expense.date,
      });

      grouped.set(expenseDateKey, list);
    });

    return Array.from(grouped.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, items]) => ({
        date,
        label: formatExpenseDateGroupLabel(date, todayIso),
        items,
      }));
  }, [categoriesQuery.data, expensesQuery.data, todayIso]);

  React.useEffect(() => {
    const firstError = expensesQuery.error ?? categoriesQuery.error;
    if (!firstError) {
      return;
    }

    const apiResult =
      firstError instanceof Error &&
      firstError.message === "Resposta inválida da API."
        ? { statusCode: undefined, body: firstError.message }
        : getApiErrorMessage(firstError);

    setLoadDialogResult(apiResult);
    setLoadDialogOpen(true);
  }, [categoriesQuery.error, expensesQuery.error]);

  const handleOpenSingleExpenseEdit = (expense: {
    id: string;
    expenseCategoryId: string;
    title: string;
    amount: string;
    date: string;
  }) => {
    setEditingSingleExpenseId(expense.id);
    singleExpenseForm.reset({
      expense_category: expense.expenseCategoryId,
      description: expense.title,
      amount: expense.amount,
      date: expense.date,
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseSingleExpenseEdit = () => {
    setIsEditDialogOpen(false);
    setEditingSingleExpenseId(null);
  };

  return (
    <>
      <WalletNewExpenseAction
        walletId={walletId}
        expenseCycleId={expenseCycleId}
        userId={userId}
      />

      <div className="mt-3">
        {isCycleLoading || expensesQuery.isLoading || categoriesQuery.isLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Carregando despesas do ciclo...
            </CardContent>
          </Card>
        ) : !expenseCycleId ? (
          <Card>
            <CardHeader>
              <CardTitle>Ciclo não encontrado</CardTitle>
              <CardDescription>
                Não foi possível resolver o ciclo para carregar as despesas.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : expenseGroups.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma despesa encontrada</CardTitle>
              <CardDescription>
                Adicione gastos para visualizar a listagem deste ciclo.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <section className="space-y-6">
            {expenseGroups.map((group) => (
              <div key={group.date} className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group.label}
                </h2>

                <div className="space-y-3">
                  {group.items.map((expense) => (
                    <WalletExpenseListItem
                      key={expense.id}
                      title={expense.title}
                      amount={expense.amount}
                      categoryName={expense.categoryName}
                      categoryIcon={expense.categoryIcon}
                      categoryColor={expense.categoryColor}
                      expenseType={expense.expenseType}
                      installmentLabel={expense.installmentLabel}
                      onEditSingleExpense={
                        expense.expenseType === "single_expense"
                          ? () => handleOpenSingleExpenseEdit(expense)
                          : undefined
                      }
                      onCancelRecurringExpense={
                        expense.expenseType === "recurring_expense"
                          ? () => {
                              setPendingCancelExpenseId(expense.id);
                              cancelRecurringMutation.mutate(expense.id);
                            }
                          : undefined
                      }
                      isActionPending={
                        editSingleExpenseMutation.isPending ||
                        (cancelRecurringMutation.isPending &&
                          pendingCancelExpenseId === expense.id)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      <ResponsiveDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        trigger={<button className="hidden" type="button" aria-hidden="true" />}
        title="Editar despesa pontual"
        description="Atualize os dados da despesa e salve as alterações."
        contentClassName="sm:max-w-[560px] gap-4"
      >
        <FormProvider {...singleExpenseForm}>
          <form
            className="space-y-4"
            onSubmit={singleExpenseForm.handleSubmit((values) =>
              editSingleExpenseMutation.mutate(values),
            )}
          >
            <div className="space-y-2">
              <label
                htmlFor="single-expense-category"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Categoria
              </label>
              <select
                id="single-expense-category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={watchedSingleExpenseCategory ?? ""}
                onChange={(event) =>
                  singleExpenseForm.setValue("expense_category", event.target.value, {
                    shouldValidate: true,
                  })
                }
                disabled={editSingleExpenseMutation.isPending}
              >
                <option value="">Selecione uma categoria</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {singleExpenseForm.formState.errors.expense_category?.message ? (
                <p className="text-sm text-destructive">
                  {singleExpenseForm.formState.errors.expense_category.message}
                </p>
              ) : null}
            </div>

            <ControlledInput
              name="description"
              label="Descrição"
              placeholder="Ex.: Mercado atualizado"
              disabled={editSingleExpenseMutation.isPending}
            />

            <ControlledInput
              name="amount"
              label="Valor"
              placeholder="180.00"
              inputMode="decimal"
              disabled={editSingleExpenseMutation.isPending}
            />

            <ControlledInput
              name="date"
              label="Data"
              type="date"
              disabled={editSingleExpenseMutation.isPending}
            />

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={editSingleExpenseMutation.isPending}>
                {editSingleExpenseMutation.isPending
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSingleExpenseEdit}
                disabled={editSingleExpenseMutation.isPending}
              >
                Fechar
              </Button>
            </div>
          </form>
        </FormProvider>
      </ResponsiveDialog>

      <HttpRequestResultDialog
        title="Não foi possível carregar as despesas do ciclo"
        isOpen={loadDialogOpen}
        isSuccess={false}
        statusCode={loadDialogResult.statusCode}
        message={loadDialogResult.body}
        closeAction={() => setLoadDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setLoadDialogOpen(false)}
      />

      <HttpRequestResultDialog
        title={actionDialogTitle || "Resultado da requisição"}
        isOpen={actionDialogOpen}
        isSuccess={actionDialogStatus === "success"}
        statusCode={actionDialogResult.statusCode}
        message={actionDialogResult.body}
        closeAction={() => setActionDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setActionDialogOpen(false)}
      />
    </>
  );
}
