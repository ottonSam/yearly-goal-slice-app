import * as React from "react"

import { cn } from "@/lib/utils"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

interface CodePreProps extends React.HTMLAttributes<HTMLPreElement> {
  value: string | Json | undefined
}

function serializeCodeValue(value: string | Json | undefined) {
  if (typeof value === "string") {
    return value
  }

  if (value === undefined) {
    return "undefined"
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function CodePre({ value, className, ...props }: CodePreProps) {
  const content = serializeCodeValue(value)

  return (
    <pre
      className={cn(
        "max-h-52 overflow-auto rounded-md border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed text-foreground",
        className
      )}
      {...props}
    >
      <code>{content}</code>
    </pre>
  )
}
