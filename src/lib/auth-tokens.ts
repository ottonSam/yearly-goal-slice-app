export interface AuthTokens {
  access: string
  refresh: string
}

const STORAGE_KEY = "ygs_auth_tokens"

let cachedTokens: AuthTokens | null = null

function readFromStorage(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function getTokens() {
  if (!cachedTokens) {
    cachedTokens = readFromStorage()
  }
  return cachedTokens
}

export function setTokens(tokens: AuthTokens) {
  cachedTokens = tokens
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearTokens() {
  cachedTokens = null
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken() {
  return getTokens()?.access ?? null
}

export function getRefreshToken() {
  return getTokens()?.refresh ?? null
}
