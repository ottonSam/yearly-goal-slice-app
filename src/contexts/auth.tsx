import * as React from "react"

import {
  login as loginRequest,
  me as meRequest,
  register as registerRequest,
  verifyEmail as verifyEmailRequest,
  type LoginPayload,
  type RegisterPayload,
  type UserProfile,
  type VerifyEmailPayload,
} from "@/api/auth"
import { refreshTokens, setAuthEvents } from "@/api/http"
import {
  clearTokens,
  getTokens,
  setTokens,
  type AuthTokens,
} from "@/lib/auth-tokens"

interface AuthContextValue {
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (payload: RegisterPayload) => Promise<number>
  login: (payload: LoginPayload) => Promise<void>
  verifyEmail: (payload: VerifyEmailPayload) => Promise<number>
  logout: () => void
  refreshSession: () => Promise<string | null>
  reloadUser: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokensState] = React.useState<AuthTokens | null>(() =>
    getTokens()
  )
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const logout = React.useCallback(() => {
    clearTokens()
    setTokensState(null)
    setUser(null)
  }, [])

  const reloadUser = React.useCallback(async () => {
    const profile = await meRequest()
    setUser(profile)
  }, [])

  React.useEffect(() => {
    setAuthEvents({
      onAuthFailure: logout,
      onTokensUpdated: (nextTokens) => setTokensState(nextTokens),
    })
  }, [logout])

  React.useEffect(() => {
    const bootstrap = async () => {
      const stored = getTokens()
      if (stored?.access) {
        setTokensState(stored)
        try {
          await reloadUser()
        } catch {
          // Se o access falhar, tenta refresh
          try {
            const nextTokens = await refreshTokens()
            setTokensState(nextTokens)
            await reloadUser()
          } catch {
            logout()
          }
        }
      } else if (stored?.refresh) {
        try {
          const nextTokens = await refreshTokens()
          setTokensState(nextTokens)
          await reloadUser()
        } catch {
          logout()
        }
      }
      setIsLoading(false)
    }

    bootstrap()
  }, [logout, reloadUser])

  const register = React.useCallback(async (payload: RegisterPayload) => {
    return registerRequest(payload)
  }, [])

  const verifyEmail = React.useCallback(async (payload: VerifyEmailPayload) => {
    return verifyEmailRequest(payload)
  }, [])

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      const nextTokens = await loginRequest(payload)
      setTokens(nextTokens)
      setTokensState(nextTokens)
      await reloadUser()
    },
    [reloadUser]
  )

  const refreshSession = React.useCallback(async () => {
    try {
      const nextTokens = await refreshTokens()
      setTokensState(nextTokens)
      return nextTokens.access
    } catch {
      logout()
      return null
    }
  }, [logout])

  const value: AuthContextValue = {
    user,
    accessToken: tokens?.access ?? null,
    refreshToken: tokens?.refresh ?? null,
    isAuthenticated: Boolean(tokens?.access),
    isLoading,
    register,
    login,
    verifyEmail,
    logout,
    refreshSession,
    reloadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
