import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth"

export default function MePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Conta
          </p>
          <h1 className="font-display text-4xl font-semibold">Meu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Informações carregadas do endpoint <code>/auth/me/</code>.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <pre className="whitespace-pre-wrap text-sm text-foreground">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <Button variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
