import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"

const usageCode = `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a session" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="reset">Reset</SelectItem>
        <SelectItem value="focus">Focus</SelectItem>
        <SelectItem value="restore">Restore</SelectItem>
      </SelectContent>
    </Select>
  )
}`

const groupedCode = `import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SelectGrouped() {
  return (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Pick a track" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Morning</SelectLabel>
          <SelectItem value="breathe">Breathwork</SelectItem>
          <SelectItem value="stretch">Stretch</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Evening</SelectLabel>
          <SelectItem value="unwind">Unwind</SelectItem>
          <SelectItem value="restore">Restore</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}`

export default function SelectPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [value, setValue] = React.useState<string | undefined>()
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
            <h1 className="font-display text-4xl font-semibold">Select</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Custom dropdown selection built with Radix Select.
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
            Compose trigger, content, and items for selections.
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
            Toggle disabled state and track the selected value.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <Select value={value} onValueChange={setValue} disabled={disabled}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tracks</SelectLabel>
                  <SelectItem value="reset">Reset</SelectItem>
                  <SelectItem value="restore">Restore</SelectItem>
                  <SelectItem value="focus">Focus</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Value: <span className="text-foreground">{value ?? "None"}</span>
            </p>
          </div>
          <div className="space-y-4">
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
            Default, selected, and disabled examples.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Default
            </p>
            <Select>
              <SelectTrigger className="mt-3 w-full">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reset">Reset</SelectItem>
                <SelectItem value="focus">Focus</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Selected
            </p>
            <Select value="restore">
              <SelectTrigger className="mt-3 w-full">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reset">Reset</SelectItem>
                <SelectItem value="focus">Focus</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Disabled
            </p>
            <Select disabled>
              <SelectTrigger className="mt-3 w-full">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reset">Reset</SelectItem>
                <SelectItem value="focus">Focus</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Grouped Options</h2>
          <p className="text-sm text-muted-foreground">
            Add labels, separators, and grouped sections.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Select>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Pick a track" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Morning</SelectLabel>
                <SelectItem value="breathe">Breathwork</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Evening</SelectLabel>
                <SelectItem value="unwind">Unwind</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{groupedCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">With Field</h2>
          <p className="text-sm text-muted-foreground">
            Pair with label and helper text for accessibility.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Field>
            <FieldLabel htmlFor="select-session">Session type</FieldLabel>
            <FieldContent>
              <Select>
                <SelectTrigger id="select-session">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reset">Reset</SelectItem>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="restore">Restore</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Pick the focus for this session.</FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            Select wraps Radix Select primitives.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Key Props</th>
                <th className="px-4 py-3">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">Select</td>
                <td className="px-4 py-3">value, onValueChange</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">SelectTrigger</td>
                <td className="px-4 py-3">disabled</td>
                <td className="px-4 py-3">false</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">SelectContent</td>
                <td className="px-4 py-3">position</td>
                <td className="px-4 py-3">"popper"</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">SelectItem</td>
                <td className="px-4 py-3">value, disabled</td>
                <td className="px-4 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Accessibility</h2>
          <p className="text-sm text-muted-foreground">
            Select supports keyboard navigation and screen readers.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Provide a visible label or aria-label.</li>
          <li>Ensure the trigger width fits the longest option.</li>
          <li>Use SelectGroup and SelectLabel for structured lists.</li>
          <li>Keep selection feedback visible for users.</li>
        </ul>
      </section>
    </div>
  )
}
