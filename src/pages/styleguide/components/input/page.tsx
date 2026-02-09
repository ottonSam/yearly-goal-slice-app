import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const inputTypes = ["text", "email", "password", "search", "number", "file"]

const exampleCode = `import { Input } from "@/components/ui/input"

export default function EmailInput() {
  return <Input type="email" placeholder="Email address" />
}`

const invalidExample = `import { Input } from "@/components/ui/input"

export default function InvalidInput() {
  return (
    <Input
      aria-invalid="true"
      className="border-destructive focus-visible:ring-destructive"
      placeholder="Session name"
    />
  )
}`

export default function InputPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("Email address")
  const [type, setType] = React.useState("email")
  const [disabled, setDisabled] = React.useState(false)

  React.useEffect(() => {
    const prefersDark = document.documentElement.classList.contains("dark")
    setIsDark(prefersDark)
  }, [])

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Components
            </p>
            <h1 className="font-display text-4xl font-semibold">Input</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A single-line field styled with the design tokens, ready for forms
              and lightweight data entry.
            </p>
          </div>
          <Button
            variant={isDark ? "secondary" : "default"}
            onClick={() => setIsDark((prev) => !prev)}
          >
            {isDark ? "Switch to Light" : "Switch to Dark"}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Usage</h2>
          <p className="text-sm text-muted-foreground">
            Import the shadcn input and pass any native input props.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{exampleCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Playground</h2>
          <p className="text-sm text-muted-foreground">
            Adjust props to preview common configurations.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <Input
              type={type}
              value={value}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(event) => setValue(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Value: <span className="text-foreground">{value || "—"}</span>
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Type
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                {inputTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Placeholder
              </label>
              <Input
                value={placeholder}
                onChange={(event) => setPlaceholder(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(event) => setDisabled(event.target.checked)}
                className="h-4 w-4 rounded border border-input text-primary"
              />
              Disabled
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">States</h2>
          <p className="text-sm text-muted-foreground">
            Common UI states and light customization.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Default",
              input: <Input placeholder="Session topic" />,
            },
            {
              label: "With value",
              input: <Input defaultValue="Mindful Reset" />,
            },
            {
              label: "Disabled",
              input: <Input placeholder="Disabled" disabled />,
            },
            {
              label: "Invalid",
              input: (
                <Input
                  aria-invalid="true"
                  className="border-destructive focus-visible:ring-destructive"
                  placeholder="Missing info"
                />
              ),
            },
          ].map((state) => (
            <div
              key={state.label}
              className="space-y-2 rounded-lg border border-border bg-card p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {state.label}
              </p>
              {state.input}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Sizes</h2>
          <p className="text-sm text-muted-foreground">
            Adjust height with utility classes when you need compact or roomy
            fields.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Compact", className: "h-9 text-sm" },
            { label: "Default", className: "" },
            { label: "Large", className: "h-12 text-base" },
          ].map((size) => (
            <div
              key={size.label}
              className="space-y-2 rounded-lg border border-border bg-card p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {size.label}
              </p>
              <Input
                placeholder={`${size.label} input`}
                className={cn(size.className)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            Input extends native <code>&lt;input&gt;</code> props.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Prop</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">className</td>
                <td className="px-4 py-3">string</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">type</td>
                <td className="px-4 py-3">string</td>
                <td className="px-4 py-3">"text"</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">disabled</td>
                <td className="px-4 py-3">boolean</td>
                <td className="px-4 py-3">false</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">value</td>
                <td className="px-4 py-3">string | number</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">onChange</td>
                <td className="px-4 py-3">function</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Code Examples</h2>
          <p className="text-sm text-muted-foreground">
            Styling for inline validation or warnings.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{invalidExample}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Accessibility</h2>
          <p className="text-sm text-muted-foreground">
            Build inclusive forms with clear labeling and state cues.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Pair inputs with a visible label or aria-label.</li>
          <li>Use aria-invalid and helper text for error states.</li>
          <li>Keep placeholder text supplemental, not the only label.</li>
          <li>Ensure focus rings remain visible against backgrounds.</li>
        </ul>
      </section>
    </div>
  )
}
