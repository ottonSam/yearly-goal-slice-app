import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/contexts/use-theme"
import { cn } from "@/lib/utils"

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 w-[68px] items-center rounded-full border border-border bg-muted p-1 transition-colors",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform",
          isDark ? "translate-x-[30px]" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4" aria-hidden />
        ) : (
          <Sun className="h-4 w-4" aria-hidden />
        )}
      </span>
    </button>
  )
}
