import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

const usageCode = `import { Textarea } from "@/components/ui/textarea"

export default function TextareaDemo() {
  return <Textarea placeholder="Type your message here." />
}`

const fieldCode = `import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export default function FieldTextarea() {
  return (
    <Field>
      <FieldLabel htmlFor="notes">Notes</FieldLabel>
      <FieldContent>
        <Textarea id="notes" placeholder="Add session notes" />
        <FieldDescription>Visible only to the facilitator.</FieldDescription>
      </FieldContent>
    </Field>
  )
}`

export default function TextareaPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [rows, setRows] = React.useState(4)
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
            <h1 className="font-display text-4xl font-semibold">Textarea</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Multiline text input styled with shadcn tokens.
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
            Use for longer text input and notes.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{usageCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Playground</h2>
          <p className="text-sm text-muted-foreground">
            Adjust rows and toggle disabled state.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <Textarea
              rows={rows}
              placeholder="Add session reflections"
              value={value}
              disabled={disabled}
              onChange={(event) => setValue(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Characters:{" "}
              <span className="text-foreground">{value.length}</span>
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Rows
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={rows}
                onChange={(event) => setRows(Number(event.target.value))}
                className="w-full"
              />
              <p className="text-sm text-foreground">{rows} rows</p>
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
            Default, filled, and invalid styles.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Default",
              field: <Textarea placeholder="Session notes" />,
            },
            {
              label: "Filled",
              field: (
                <Textarea defaultValue="Client requested grounding exercises." />
              ),
            },
            {
              label: "Disabled",
              field: <Textarea placeholder="Disabled" disabled />,
            },
            {
              label: "Invalid",
              field: (
                <Textarea
                  aria-invalid="true"
                  className="border-destructive focus-visible:ring-destructive"
                  placeholder="Missing details"
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
              {state.field}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">With Field</h2>
          <p className="text-sm text-muted-foreground">
            Pair with labels and helper text for accessibility.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <FieldContent>
              <Textarea id="notes" placeholder="Add session notes" />
              <FieldDescription>
                Visible only to the facilitator.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{fieldCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            Textarea extends native <code>&lt;textarea&gt;</code> props.
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
                <td className="px-4 py-3 font-medium">rows</td>
                <td className="px-4 py-3">number</td>
                <td className="px-4 py-3">2</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">value</td>
                <td className="px-4 py-3">string</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">onChange</td>
                <td className="px-4 py-3">function</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">disabled</td>
                <td className="px-4 py-3">boolean</td>
                <td className="px-4 py-3">false</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Accessibility</h2>
          <p className="text-sm text-muted-foreground">
            Keep labels visible and describe the expected input.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Associate labels with `htmlFor` and `id`.</li>
          <li>Use helper text for length or formatting guidance.</li>
          <li>Expose invalid state with aria-invalid when needed.</li>
          <li>Keep placeholder text supplemental, not a label.</li>
        </ul>
      </section>
    </div>
  )
}
