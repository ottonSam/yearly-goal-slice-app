import * as React from "react";
import { Calendar, Plus, Receipt, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import {
  createWalletExpenseCategory,
  listWalletExpenseCategories,
} from "@/api/wallets";
import {
  getExpenseCategoryIconByName,
  getExpenseCategoryIconOptionByName,
  listExpenseCategoryIconOptions,
} from "@/assets/utils/expenseCategoryIcons";
import { getApiErrorMessage } from "@/assets/utils/getApiErrorMessage";
import { ControlledInput } from "@/components/form/ControlledInput";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { userScopedKey } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  walletExpenseCategoryFormSchema,
  walletExpenseCategoryListSchema,
  walletExpenseFormSchema,
  type WalletExpenseCategoryFormValues,
  type WalletExpenseFormValues,
} from "@/schemas/wallet-expense";

const CATEGORY_COLOR_OPTIONS = [
  "#67C80F",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

const EXPENSE_TYPE_OPTIONS: Array<{
  value: WalletExpenseFormValues["expense_type"];
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "single_expense", label: "Pontual", Icon: Receipt },
  { value: "recurring_expense", label: "Recorrente", Icon: RefreshCw },
  { value: "installment_expense", label: "Parcelado", Icon: Calendar },
];

interface WalletExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onSubmit: (values: WalletExpenseFormValues) => void;
  onCancel: () => void;
  userId?: string | number;
  trigger?: React.ReactNode;
}

export function WalletExpenseFormDialog({
  open,
  onOpenChange,
  isPending = false,
  onSubmit,
  onCancel,
  userId,
  trigger,
}: WalletExpenseFormDialogProps) {
  const queryClient = useQueryClient();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [categorySubmitError, setCategorySubmitError] = React.useState("");
  const categoryIconOptions = React.useMemo(
    () => listExpenseCategoryIconOptions(),
    [],
  );
  const defaultCategoryIconOption = React.useMemo(
    () => getExpenseCategoryIconOptionByName("mdi:food"),
    [],
  );

  const form = useForm<WalletExpenseFormValues>({
    resolver: zodResolver(walletExpenseFormSchema),
    defaultValues: {
      expense_type: "single_expense",
      expense_category: "",
      description: "",
      amount: "",
      date: "",
      total_amount: "",
      installments_count: 1,
      start_date: "",
    },
  });

  const categoryForm = useForm<WalletExpenseCategoryFormValues>({
    resolver: zodResolver(walletExpenseCategoryFormSchema),
    defaultValues: {
      name: "",
      icon: defaultCategoryIconOption.value,
      color: CATEGORY_COLOR_OPTIONS[0] ?? "#67C80F",
    },
  });

  const expenseType = useWatch({
    control: form.control,
    name: "expense_type",
  });
  const selectedExpenseCategory = useWatch({
    control: form.control,
    name: "expense_category",
  });
  const selectedCategoryIcon = useWatch({
    control: categoryForm.control,
    name: "icon",
  });
  const selectedCategoryColor = useWatch({
    control: categoryForm.control,
    name: "color",
  });

  const isInstallment = expenseType === "installment_expense";

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
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

  const createCategoryMutation = useMutation({
    mutationFn: async (values: WalletExpenseCategoryFormValues) =>
      createWalletExpenseCategory(values),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: userScopedKey(userId, "wallets", "categories"),
      });

      form.setValue("expense_category", response.data.id, {
        shouldValidate: true,
      });
      categoryForm.reset({
        name: "",
        icon: defaultCategoryIconOption.value,
        color: CATEGORY_COLOR_OPTIONS[0] ?? "#67C80F",
      });
      setCategorySubmitError("");
      setIsCategoryDialogOpen(false);
    },
    onError: (error) => {
      const apiResult = getApiErrorMessage(error);
      const errorMessage =
        typeof apiResult.body === "string"
          ? apiResult.body
          : JSON.stringify(apiResult.body);
      setCategorySubmitError(errorMessage);
    },
  });

  React.useEffect(() => {
    if (!open) {
      form.reset({
        expense_type: "single_expense",
        expense_category: "",
        description: "",
        amount: "",
        date: "",
        total_amount: "",
        installments_count: 1,
        start_date: "",
      });
    }
  }, [form, open]);

  React.useEffect(() => {
    if (!isCategoryDialogOpen) {
      setCategorySubmitError("");
    }
  }, [isCategoryDialogOpen]);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        trigger ?? (
          <Button type="button" disabled={isPending}>
            Novo gasto
          </Button>
        )
      }
      title="Novo gasto"
      description="Selecione o tipo de despesa e preencha os dados."
      contentClassName="sm:max-w-[620px] gap-4"
    >
      <FormProvider {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tipo de despesa
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de despesa">
              {EXPENSE_TYPE_OPTIONS.map(({ value, label, Icon }) => {
                const isSelected = (expenseType ?? "single_expense") === value;

                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-2xl border p-3 text-center transition-colors sm:p-4",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/20 text-foreground hover:bg-muted/40",
                    )}
                    onClick={() =>
                      form.setValue("expense_type", value, {
                        shouldValidate: true,
                      })
                    }
                    disabled={isPending}
                  >
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="wallet-expense-category"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Categoria
            </label>

            <div className="flex items-center gap-2">
              <select
                id="wallet-expense-category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={selectedExpenseCategory ?? ""}
                onChange={(event) =>
                  form.setValue("expense_category", event.target.value, {
                    shouldValidate: true,
                  })
                }
                disabled={isPending || isLoadingCategories}
              >
                <option value="">
                  {isLoadingCategories
                    ? "Carregando categorias..."
                    : "Selecione uma categoria"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <ResponsiveDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || createCategoryMutation.isPending}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Nova categoria
                  </Button>
                }
                title="Nova categoria"
                description="Defina nome, cor e ícone da categoria."
                contentClassName="sm:max-w-[640px] gap-4"
              >
                <FormProvider {...categoryForm}>
                  <form
                    className="space-y-4"
                    onSubmit={categoryForm.handleSubmit((values) =>
                      createCategoryMutation.mutate(values),
                    )}
                  >
                    <ControlledInput
                      name="name"
                      label="Nome"
                      placeholder="Ex.: Alimentação"
                      disabled={createCategoryMutation.isPending}
                    />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Cor de identificação
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {CATEGORY_COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={cn(
                              "h-10 w-10 rounded-full border-2 transition-all",
                              selectedCategoryColor === color
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-transparent",
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              categoryForm.setValue("color", color, {
                                shouldValidate: true,
                              })
                            }
                            aria-label={`Selecionar cor ${color}`}
                            disabled={createCategoryMutation.isPending}
                          />
                        ))}
                      </div>
                      {categoryForm.formState.errors.color?.message ? (
                        <p className="text-sm text-destructive">
                          {categoryForm.formState.errors.color.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Ícone
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                        {categoryIconOptions.map(({ value, label }) => {
                          const Icon = getExpenseCategoryIconByName(value);

                          return (
                            <button
                              key={value}
                              type="button"
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-sm transition-colors",
                                selectedCategoryIcon === value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
                              )}
                              onClick={() =>
                                categoryForm.setValue("icon", value, {
                                  shouldValidate: true,
                                })
                              }
                              aria-label={`Selecionar ícone ${label}`}
                              disabled={createCategoryMutation.isPending}
                            >
                              <Icon className="h-5 w-5" aria-hidden />
                            </button>
                          );
                        })}
                      </div>
                      {categoryForm.formState.errors.icon?.message ? (
                        <p className="text-sm text-destructive">
                          {categoryForm.formState.errors.icon.message}
                        </p>
                      ) : null}
                    </div>

                    {categorySubmitError ? (
                      <p className="text-sm text-destructive">
                        {categorySubmitError}
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-2">
                      <Button
                        type="submit"
                        disabled={createCategoryMutation.isPending}
                      >
                        {createCategoryMutation.isPending
                          ? "Criando..."
                          : "Criar categoria"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCategoryDialogOpen(false)}
                        disabled={createCategoryMutation.isPending}
                      >
                        Fechar
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </ResponsiveDialog>
            </div>

            {form.formState.errors.expense_category?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.expense_category.message}
              </p>
            ) : null}
          </div>

          <ControlledInput
            name="description"
            label="Descrição"
            placeholder="Ex.: Mercado"
            disabled={isPending}
          />

          {isInstallment ? (
            <>
              <ControlledInput
                name="total_amount"
                label="Valor total"
                placeholder="2400.00"
                inputMode="decimal"
                disabled={isPending}
              />
              <ControlledInput
                name="installments_count"
                label="Quantidade de parcelas"
                type="number"
                min={1}
                step={1}
                disabled={isPending}
              />
              <ControlledInput
                name="start_date"
                label="Data inicial"
                type="date"
                disabled={isPending}
              />
            </>
          ) : (
            <>
              <ControlledInput
                name="amount"
                label="Valor"
                placeholder="150.00"
                inputMode="decimal"
                disabled={isPending}
              />
              <ControlledInput
                name="date"
                label="Data"
                type="date"
                disabled={isPending}
              />
            </>
          )}

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : isInstallment
                  ? "Criar despesa parcelada"
                  : "Criar despesa"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Fechar
            </Button>
          </div>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}
