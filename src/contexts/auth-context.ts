import * as React from "react"

import type {
  LoginPayload,
  RegisterPayload,
  UserProfile,
  VerifyEmailPayload,
} from "@/api/auth"

export interface AuthContextValue {
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

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)
