import axios from "axios";

type ApiErrorData =
  | { detail?: string; message?: string }
  | Record<string, string[]>
  | string
  | undefined;

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData;

    if (typeof data === "string") {
      return data;
    }

    if (data && typeof data === "object") {
      if ("detail" in data && typeof data.detail === "string") {
        return data.detail;
      }
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }

      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const firstValue = (data as Record<string, string[]>)[firstKey];
        if (Array.isArray(firstValue) && firstValue.length > 0) {
          return firstValue[0];
        }
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  return "Não foi possível concluir a ação. Tente novamente mais tarde.";
}
