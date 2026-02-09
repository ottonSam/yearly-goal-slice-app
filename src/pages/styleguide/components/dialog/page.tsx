import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const usageCode = `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session details</DialogTitle>
          <DialogDescription>
            Update your session notes and save.
          </DialogDescription>
        </DialogHeader>
        <div>Content goes here.</div>
      </DialogContent>
    </Dialog>
  )
}`

const formCode = `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DialogForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Update session</DialogTitle>
          <DialogDescription>
            Adjust the invite details and save when ready.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input placeholder="Session title" />
          <Input placeholder="Location" />
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`

export default function DialogPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [size, setSize] = React.useState("default")
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const prefersDark = document.documentElement.classList.contains("dark")
    setIsDark(prefersDark)
  }, [])

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  const sizeClass =
    size === "compact"
      ? "sm:max-w-[360px]"
      : size === "wide"
        ? "sm:max-w-[680px]"
        : "sm:max-w-[520px]"

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Components
            </p>
            <h1 className="font-display text-4xl font-semibold">Dialog</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A modal overlay for focused tasks and confirmations.
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
            Trigger a dialog with a button and place content inside.
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
            Toggle size and open state.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Configure dialog</Button>
              </DialogTrigger>
              <DialogContent className={sizeClass}>
                <DialogHeader>
                  <DialogTitle>Session focus</DialogTitle>
                  <DialogDescription>
                    Adjust settings for the upcoming session.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="dialog-title">Title</FieldLabel>
                    <FieldContent>
                      <Input id="dialog-title" placeholder="Breathwork reset" />
                      <FieldDescription>
                        Visible to attendees in calendar invites.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="dialog-location">Location</FieldLabel>
                    <Input id="dialog-location" placeholder="Studio A" />
                  </Field>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => setOpen(false)}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Size
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={size}
                onChange={(event) => setSize(event.target.value)}
              >
                <option value="compact">compact</option>
                <option value="default">default</option>
                <option value="wide">wide</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={open}
                onChange={(event) => setOpen(event.target.checked)}
                className="h-4 w-4 rounded border border-input text-primary"
              />
              Open dialog
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Common Layouts</h2>
          <p className="text-sm text-muted-foreground">
            Dialogs for quick edits, confirmations, and metadata.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Edit session</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Edit session</DialogTitle>
                  <DialogDescription>
                    Update the essentials for the next session.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Input placeholder="Session title" />
                  <Input placeholder="Host name" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Confirm changes</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reschedule session?</DialogTitle>
                  <DialogDescription>
                    The participants will be notified immediately.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Keep current</Button>
                  </DialogClose>
                  <Button>Reschedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{formCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            Dialog is built on Radix primitives with composition APIs.
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
                <td className="px-4 py-3 font-medium">Dialog</td>
                <td className="px-4 py-3">open, onOpenChange</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">DialogContent</td>
                <td className="px-4 py-3">className</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">DialogTrigger</td>
                <td className="px-4 py-3">asChild</td>
                <td className="px-4 py-3">false</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">DialogClose</td>
                <td className="px-4 py-3">asChild</td>
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
            Dialogs trap focus and announce content to assistive tech.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Always include DialogTitle for screen readers.</li>
          <li>Provide DialogDescription for context when needed.</li>
          <li>Ensure a close control is visible and reachable.</li>
          <li>Use aria-describedby only when supplemental text exists.</li>
        </ul>
      </section>
    </div>
  )
}
