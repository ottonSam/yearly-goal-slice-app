import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const usageCode = `import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function SessionField() {
  return (
    <Field>
      <FieldLabel htmlFor="session-name">Session name</FieldLabel>
      <Input id="session-name" placeholder="Weekly reset" />
      <FieldDescription>Use a short, descriptive title.</FieldDescription>
    </Field>
  )
}`

const horizontalCode = `import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function HorizontalField() {
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <FieldContent>
        <Input id="email" type="email" placeholder="email@domain.com" />
        <FieldDescription>We'll only contact you about scheduling.</FieldDescription>
      </FieldContent>
    </Field>
  )
}`

export default function FieldPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [orientation, setOrientation] = React.useState("vertical")
  const [invalid, setInvalid] = React.useState(false)
  const [label, setLabel] = React.useState("Session name")

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
            <h1 className="font-display text-4xl font-semibold">Field</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Field groups input elements, labels, descriptions, and validation
              text into consistent layouts.
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
            Compose fields with label, control, and helper text.
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
            Toggle layout and validation states.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <Field
              orientation={orientation as "vertical" | "horizontal" | "responsive"}
              data-invalid={invalid ? "" : undefined}
            >
              <FieldLabel htmlFor="playground-field">{label}</FieldLabel>
              <FieldContent>
                <Input
                  id="playground-field"
                  placeholder="Weekly reset"
                  aria-invalid={invalid}
                />
                <FieldDescription>
                  Keep the label short and focused on outcomes.
                </FieldDescription>
                <FieldError>
                  {invalid ? "Please enter a session name." : null}
                </FieldError>
              </FieldContent>
            </Field>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Orientation
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={orientation}
                onChange={(event) => setOrientation(event.target.value)}
              >
                <option value="vertical">vertical</option>
                <option value="horizontal">horizontal</option>
                <option value="responsive">responsive</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Label
              </label>
              <Input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={invalid}
                onChange={(event) => setInvalid(event.target.checked)}
                className="h-4 w-4 rounded border border-input text-primary"
              />
              Invalid state
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Layouts</h2>
          <p className="text-sm text-muted-foreground">
            Use orientation to align labels and controls.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <Field orientation="vertical">
              <FieldLabel htmlFor="vertical-email">Email</FieldLabel>
              <Input id="vertical-email" type="email" placeholder="you@domain.com" />
              <FieldDescription>Reminders will be sent here.</FieldDescription>
            </Field>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Field orientation="horizontal">
              <FieldLabel htmlFor="horizontal-timezone">Timezone</FieldLabel>
              <FieldContent>
                <Input
                  id="horizontal-timezone"
                  placeholder="America/Los_Angeles"
                />
                <FieldDescription>Used for appointment times.</FieldDescription>
              </FieldContent>
            </Field>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{horizontalCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Field Sets</h2>
          <p className="text-sm text-muted-foreground">
            Group related fields with legends, separators, and inline actions.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Session Details</FieldLegend>
              <FieldDescription>Collect the key planning details.</FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="field-title">Title</FieldLabel>
                  <Input id="field-title" placeholder="Breathwork reset" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="field-location">Location</FieldLabel>
                  <Input id="field-location" placeholder="Studio A" />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator>Optional</FieldSeparator>
            <FieldSet>
              <FieldLegend variant="label">Notes</FieldLegend>
              <Field>
                <FieldTitle>Private notes</FieldTitle>
                <FieldContent>
                  <Input id="field-notes" placeholder="Anything to remember?" />
                  <FieldDescription>
                    Only visible to the facilitator.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldSet>
            <Field orientation="horizontal">
              <FieldTitle>Actions</FieldTitle>
              <div className="flex gap-2">
                <Button>Save</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </Field>
          </FieldGroup>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            Field components are lightweight wrappers around semantic elements.
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
                <td className="px-4 py-3 font-medium">Field</td>
                <td className="px-4 py-3">orientation</td>
                <td className="px-4 py-3">"vertical"</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">FieldLegend</td>
                <td className="px-4 py-3">variant</td>
                <td className="px-4 py-3">"legend"</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">FieldError</td>
                <td className="px-4 py-3">errors, issues</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Accessibility</h2>
          <p className="text-sm text-muted-foreground">
            Maintain clear relationships between labels and controls.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Associate labels with inputs via htmlFor and id.</li>
          <li>Provide helper text for required or format guidance.</li>
          <li>Expose invalid state with aria-invalid and error text.</li>
          <li>Use FieldSet and FieldLegend for grouped inputs.</li>
        </ul>
      </section>
    </div>
  )
}
