import * as React from "react"

export type ThemeMode = "light" | "dark"

export interface ThemeContextValue {
  theme: ThemeMode
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)
