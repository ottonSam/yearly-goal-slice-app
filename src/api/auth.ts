import { api } from "@/api/http"
import type { AuthTokens } from "@/lib/auth-tokens"

export interface RegisterPayload {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface UpdateProfilePayload {
  first_name: string
  last_name: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface UserProfile {
  id?: string | number
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  [key: string]: unknown
}

export async function register(payload: RegisterPayload) {
  await api.post("/auth/register/", payload)
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthTokens>("/auth/login/", payload)
  return data
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  await api.post("/auth/verify-email/", payload)
}

export async function me() {
  const { data } = await api.get<UserProfile>("/auth/me/")
  return data
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await api.put<UserProfile>("/auth/update-profile/", payload)
  return data
}

export async function changePassword(payload: ChangePasswordPayload) {
  await api.post("/auth/change-password/", payload)
}
