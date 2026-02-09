import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"

const usageCode = `import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxDemo() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="terms" />
      <label htmlFor="terms">Accept terms and conditions</label>
    </div>
  )
}`

const groupCode = `import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxGroup() {
  return (
    <div className="grid gap-3">
      <label className="flex items-center gap-3">
        <Checkbox defaultChecked />
        Weekly summary emails
      </label>
      <label className="flex items-center gap-3">
        <Checkbox />
        Session reminders
      </label>
    </div>
  )
}`

export default function CheckboxPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
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
            <h1 className="font-display text-4xl font-semibold">Checkbox</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Boolean inputs for selections and opt-ins.
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
            Pair with a label to clarify the selection.
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
            Toggle checked and disabled states.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => setChecked(Boolean(value))}
              />
              Receive session notes
            </label>
            <p className="text-xs text-muted-foreground">
              Value:{" "}
              <span className="text-foreground">
                {checked ? "Checked" : "Unchecked"}
              </span>
            </p>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="h-4 w-4 rounded border border-input text-primary"
              />
              Checked
            </label>
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
            Default, checked, and disabled examples.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Default",
              content: (
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox />
                  Send reminders
                </label>
              ),
            },
            {
              label: "Checked",
              content: (
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox defaultChecked />
                  Receive summary
                </label>
              ),
            },
            {
              label: "Disabled",
              content: (
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox disabled />
                  Disabled option
                </label>
              ),
            },
            {
              label: "Invalid",
              content: (
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox
                    className="border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                    defaultChecked
                  />
                  Needs review
                </label>
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
              {state.content}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Grouped</h2>
          <p className="text-sm text-muted-foreground">
            Combine checkboxes for settings and preferences.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid gap-3">
            {["Weekly summary emails", "Session reminders", "Share insights"].map(
              (label) => (
                <label key={label} className="flex items-center gap-3 text-sm">
                  <Checkbox />
                  {label}
                </label>
              )
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{groupCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">With Field</h2>
          <p className="text-sm text-muted-foreground">
            Pair with helper text and a field wrapper.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="share">Share insights</FieldLabel>
            <FieldContent>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox id="share" />
                Allow anonymized insights to be shared.
              </label>
              <FieldDescription>
                You can opt out at any time.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            Checkbox wraps Radix Checkbox primitives.
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
                <td className="px-4 py-3 font-medium">checked</td>
                <td className="px-4 py-3">boolean | "indeterminate"</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">onCheckedChange</td>
                <td className="px-4 py-3">function</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">disabled</td>
                <td className="px-4 py-3">boolean</td>
                <td className="px-4 py-3">false</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">required</td>
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
            Keep checkbox labels explicit and clickable.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Associate labels with htmlFor and id.</li>
          <li>Use `aria-describedby` for helper text.</li>
          <li>Prefer larger hit targets for mobile.</li>
          <li>Communicate required or disabled state clearly.</li>
        </ul>
      </section>
    </div>
  )
}
