import axios from "axios"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface ApiErrorResult {
  statusCode: number | undefined
  body: string | Json
}

function toJsonLikeValue(data: unknown): string | Json {
  if (data === undefined) {
    return "Sem detalhes de erro retornados pela API."
  }

  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean" ||
    data === null
  ) {
    return data
  }

  if (Array.isArray(data) || (typeof data === "object" && data !== null)) {
    return data as Json
  }

  return String(data)
}

export function getApiErrorMessage(error: unknown): ApiErrorResult {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status
    const body =
      statusCode === 500
        ? "internal server error"
        : toJsonLikeValue(error.response?.data)

    return {
      statusCode,
      body,
    }
  }

  return {
    statusCode: undefined,
    body: "Não foi possível concluir a ação. Tente novamente mais tarde.",
  }
}
