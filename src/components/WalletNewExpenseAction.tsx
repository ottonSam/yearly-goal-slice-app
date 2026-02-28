import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createInstallmentSeries,
  createWalletExpense,
} from "@/api/wallets";
import {
  getApiErrorMessage,
  type ApiErrorResult,
} from "@/assets/utils/getApiErrorMessage";
import { normalizeMoneyInput } from "@/assets/utils/money";
import { WalletExpenseFormDialog } from "@/components/WalletExpenseFormDialog";
import { HttpRequestResultDialog } from "@/components/HttpRequestResultDialog";
import { Button } from "@/components/ui/button";
import { userScopedKey } from "@/lib/query-keys";
import { type WalletExpenseFormValues } from "@/schemas/wallet-expense";

interface WalletNewExpenseActionProps {
  walletId?: string;
  expenseCycleId?: string;
  userId?: string | number;
}

export function WalletNewExpenseAction({
  walletId,
  expenseCycleId,
  userId,
}: WalletNewExpenseActionProps) {
  const queryClient = useQueryClient();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = React.useState(false);

  const [resultDialogOpen, setResultDialogOpen] = React.useState(false);
  const [resultDialogStatus, setResultDialogStatus] = React.useState<
    "success" | "error"
  >("error");
  const [resultDialogTitle, setResultDialogTitle] = React.useState("");
  const [resultDialogResult, setResultDialogResult] = React.useState<ApiErrorResult>({
    statusCode: undefined,
    body: "",
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (values: WalletExpenseFormValues) => {
      if (!walletId) {
        throw new Error("Wallet id não informado.");
      }

      if (values.expense_type === "installment_expense") {
        return createInstallmentSeries({
          wallet: walletId,
          expense_category: values.expense_category,
          description: values.description,
          total_amount: normalizeMoneyInput(values.total_amount ?? ""),
          installments_count: values.installments_count ?? 1,
          start_date: values.start_date ?? "",
        });
      }

      if (!expenseCycleId) {
        throw new Error("Ciclo não encontrado para criar despesa.");
      }

      return createWalletExpense({
        expense_cycle: expenseCycleId,
        expense_category: values.expense_category,
        description: values.description,
        amount: normalizeMoneyInput(values.amount ?? ""),
        type: values.expense_type,
        date: values.date ?? "",
      });
    },
    onSuccess: async (response, values) => {
      setIsExpenseDialogOpen(false);
      await queryClient.invalidateQueries({
        queryKey: userScopedKey(userId, "wallets", "cycle", "expenses"),
      });

      setResultDialogStatus("success");
      setResultDialogTitle("Gasto criado");
      setResultDialogResult({
        statusCode: response.statusCode,
        body:
          values.expense_type === "installment_expense"
            ? "A série parcelada foi criada com sucesso."
            : "A despesa foi criada com sucesso.",
      });
      setResultDialogOpen(true);
    },
    onError: (error) => {
      setResultDialogStatus("error");
      setResultDialogTitle("Não foi possível criar o gasto");
      setResultDialogResult(getApiErrorMessage(error));
      setResultDialogOpen(true);
    },
  });

  return (
    <>
      <WalletExpenseFormDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        isPending={createExpenseMutation.isPending}
        onSubmit={(values) => createExpenseMutation.mutate(values)}
        onCancel={() => setIsExpenseDialogOpen(false)}
        userId={userId}
        trigger={
          <Button
            type="button"
            className="w-full"
            disabled={!walletId || !expenseCycleId || createExpenseMutation.isPending}
          >
            Novo gasto
          </Button>
        }
      />

      <HttpRequestResultDialog
        title={resultDialogTitle || "Resultado da requisição"}
        isOpen={resultDialogOpen}
        isSuccess={resultDialogStatus === "success"}
        statusCode={resultDialogResult.statusCode}
        message={resultDialogResult.body}
        closeAction={() => setResultDialogOpen(false)}
        buttonTitle="Fechar"
        buttonAction={() => setResultDialogOpen(false)}
      />
    </>
  );
}
