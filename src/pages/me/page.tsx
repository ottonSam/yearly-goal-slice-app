import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { changePassword, updateProfile } from "@/api/auth";
import { getApiErrorMessage } from "@/assets/utils/getApiErrorMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/ControlledInput";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { useAuth } from "@/contexts/auth";
import successGator from "@/assets/img/sucessgator.png";
import errorGator from "@/assets/img/errorgator.png";
import {
  changePasswordSchema,
  updateProfileSchema,
  userProfileSchema,
  type ChangePasswordFormValues,
  type UpdateProfileFormValues,
} from "@/schemas/profile";

export default function MePage() {
  const { user, reloadUser } = useAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState("");
  const [dialogTitle, setDialogTitle] = React.useState("Não foi possível salvar");
  const [dialogDescription, setDialogDescription] = React.useState(
    "Confira os dados e tente novamente."
  );
  const [reloadOnClose, setReloadOnClose] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<"success" | "error">(
    "error"
  );

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  React.useEffect(() => {
    profileForm.reset({
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
    });
  }, [profileForm, user?.first_name, user?.last_name]);

  const handleProfileSubmit = async (data: UpdateProfileFormValues) => {
    try {
      const response = await updateProfile(data);
      const parsed = userProfileSchema.safeParse(response);
      if (!parsed.success) {
        throw new Error("Resposta inválida da API.");
      }
      await reloadUser();
      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error && error.message === "Resposta inválida da API."
          ? error.message
          : getApiErrorMessage(error);
      setReloadOnClose(false);
      setDialogStatus("error");
      setDialogTitle("Não foi possível salvar");
      setDialogDescription("Confira os dados e tente novamente.");
      setDialogMessage(message);
      setDialogOpen(true);
    }
  };

  const handlePasswordSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setDialogStatus("success");
      setDialogTitle("Senha atualizada");
      setDialogDescription("Sua senha foi alterada com sucesso.");
      setDialogMessage("Clique em fechar para atualizar a tela.");
      setReloadOnClose(true);
      setDialogOpen(true);
    } catch (error) {
      setReloadOnClose(false);
      setDialogStatus("error");
      setDialogTitle("Não foi possível salvar");
      setDialogDescription("Confira os dados e tente novamente.");
      setDialogMessage(getApiErrorMessage(error));
      setDialogOpen(true);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações pessoais e sua senha de acesso.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dados atuais</CardTitle>
          <CardDescription>
            Informações retornadas pela API no momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-foreground">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar perfil</CardTitle>
          <CardDescription>
            Atualize seu nome e sobrenome.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...profileForm}>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
            >
              <ControlledInput
                name="first_name"
                label="Nome"
                autoComplete="given-name"
              />

              <ControlledInput
                name="last_name"
                label="Sobrenome"
                autoComplete="family-name"
              />

              <CardFooter className="justify-end px-0 pb-0">
                <Button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                >
                  {profileForm.formState.isSubmitting
                    ? "Salvando..."
                    : "Salvar alterações"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>
            Defina uma nova senha para proteger sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...passwordForm}>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            >
              <ControlledInput
                name="current_password"
                label="Senha atual"
                type="password"
                autoComplete="current-password"
              />

              <ControlledInput
                name="new_password"
                label="Nova senha"
                type="password"
                autoComplete="new-password"
              />

              <ControlledInput
                name="confirm_new_password"
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
              />

              <CardFooter className="justify-end px-0 pb-0">
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting
                    ? "Atualizando..."
                    : "Atualizar senha"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && reloadOnClose) {
            window.location.reload();
          }
        }}
        trigger={<button className="hidden" type="button" aria-hidden="true" />}
        title={dialogTitle}
        description={dialogDescription}
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false);
              if (reloadOnClose) {
                window.location.reload();
              }
            }}
          >
            Fechar
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src={dialogStatus === "success" ? successGator : errorGator}
            alt={dialogStatus === "success" ? "Sucesso" : "Erro"}
            className="h-28 w-28 object-contain"
          />
          <p className="text-center text-sm text-muted-foreground">
            {dialogMessage}
          </p>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
