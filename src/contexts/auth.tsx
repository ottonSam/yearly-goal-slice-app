import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

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
import { AuthContext, type AuthContextValue } from "@/contexts/auth-context"
import { refreshTokens, setAuthEvents } from "@/api/http"
import {
  clearTokens,
  getTokens,
  setTokens,
  type AuthTokens,
} from "@/lib/auth-tokens"
import { userScopedKey } from "@/lib/query-keys"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [tokens, setTokensState] = React.useState<AuthTokens | null>(() =>
    getTokens()
  )
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const logout = React.useCallback(() => {
    clearTokens()
    queryClient.clear()
    setTokensState(null)
    setUser(null)
  }, [queryClient])

  const reloadUser = React.useCallback(async () => {
    const profile = await queryClient.fetchQuery({
      queryKey: userScopedKey(user?.id, "auth", "me"),
      queryFn: meRequest,
    })

    setUser(profile)
  }, [queryClient, user?.id])

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
