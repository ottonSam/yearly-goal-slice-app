export function userScopedKey(
  userId: string | number | null | undefined,
  ...segments: Array<string | number>
) {
  return ["user", String(userId ?? "unknown"), ...segments] as const
}
