import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const usageCode = `import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Session plan</DrawerTitle>
          <DrawerDescription>
            Update the plan and save.
          </DrawerDescription>
        </DrawerHeader>
        <div>Content goes here.</div>
      </DrawerContent>
    </Drawer>
  )
}`

const formCode = `import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DrawerForm() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit plan</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Update plan</DrawerTitle>
        </DrawerHeader>
        <div className="grid gap-4">
          <Input placeholder="Session title" />
          <Input placeholder="Location" />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit">Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}`

export default function DrawerPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [size, setSize] = React.useState("default")

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
        ? "sm:max-w-[720px]"
        : "sm:max-w-[520px]"

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Components
            </p>
            <h1 className="font-display text-4xl font-semibold">Drawer</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A bottom sheet overlay for quick tasks and contextual controls.
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
            Trigger the drawer from a button and provide content in the sheet.
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
            Toggle open state and preview size options.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline">Configure drawer</Button>
              </DrawerTrigger>
              <DrawerContent className={sizeClass}>
                <DrawerHeader>
                  <DrawerTitle>Session snapshot</DrawerTitle>
                  <DrawerDescription>
                    Quick edits before you publish.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="drawer-title">Title</FieldLabel>
                    <FieldContent>
                      <Input id="drawer-title" placeholder="Breathwork reset" />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="drawer-location">Location</FieldLabel>
                    <Input id="drawer-location" placeholder="Studio A" />
                  </Field>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button onClick={() => setOpen(false)}>Save</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
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
              Open drawer
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Examples</h2>
          <p className="text-sm text-muted-foreground">
            Use drawers for quick edits or confirmations.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Edit details</Button>
              </DrawerTrigger>
              <DrawerContent className="sm:max-w-[520px]">
                <DrawerHeader>
                  <DrawerTitle>Update details</DrawerTitle>
                  <DrawerDescription>
                    Keep the details in sync before sending.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid gap-4">
                  <Input placeholder="Session title" />
                  <Input placeholder="Facilitator" />
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button>Save</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Confirm update</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Publish updates?</DrawerTitle>
                  <DrawerDescription>
                    Attendees will be notified immediately.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Not yet</Button>
                  </DrawerClose>
                  <Button>Publish</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
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
            Drawer uses Vaul for sheet behavior and portals.
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
                <td className="px-4 py-3 font-medium">Drawer</td>
                <td className="px-4 py-3">open, onOpenChange</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">DrawerContent</td>
                <td className="px-4 py-3">className</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">DrawerTrigger</td>
                <td className="px-4 py-3">asChild</td>
                <td className="px-4 py-3">false</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">DrawerClose</td>
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
            Ensure focus and reading order stay predictable.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Include DrawerTitle to label the sheet.</li>
          <li>Provide descriptive helper text when needed.</li>
          <li>Keep actions in DrawerFooter for consistent navigation.</li>
          <li>Allow an easy escape with a close button or gesture.</li>
        </ul>
      </section>
    </div>
  )
}
