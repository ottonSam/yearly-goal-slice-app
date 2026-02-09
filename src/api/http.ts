import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  type AuthTokens,
} from "@/lib/auth-tokens"

const baseURL = import.meta.env.VITE_API_URL ?? ""

export const api = axios.create({ baseURL })
const refreshClient = axios.create({ baseURL })

type AuthEvents = {
  onAuthFailure?: () => void
  onTokensUpdated?: (tokens: AuthTokens) => void
}

let authEvents: AuthEvents = {}

export function setAuthEvents(events: AuthEvents) {
  authEvents = events
}

let refreshPromise: Promise<AuthTokens> | null = null

async function performRefresh(refreshToken: string) {
  const { data } = await refreshClient.post<AuthTokens>("/auth/refresh/", {
    refresh: refreshToken,
  })
  const nextTokens: AuthTokens = {
    access: data.access,
    refresh: data.refresh ?? refreshToken,
  }
  setTokens(nextTokens)
  authEvents.onTokensUpdated?.(nextTokens)
  return nextTokens
}

export async function refreshTokens() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("Missing refresh token")
  }
  return performRefresh(refreshToken)
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    if (!original || error.response?.status !== 401) {
      throw error
    }
    if (original._retry) {
      authEvents.onAuthFailure?.()
      throw error
    }
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      authEvents.onAuthFailure?.()
      throw error
    }
    original._retry = true
    try {
      refreshPromise = refreshPromise ?? performRefresh(refreshToken)
      const tokens = await refreshPromise
      refreshPromise = null
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${tokens.access}`
      return api(original)
    } catch (refreshError) {
      refreshPromise = null
      clearTokens()
      authEvents.onAuthFailure?.()
      throw refreshError
    }
  }
)
