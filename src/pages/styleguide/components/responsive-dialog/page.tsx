import * as React from "react"

import { Button } from "@/components/ui/button"
import { DrawerClose } from "@/components/ui/drawer"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ResponsiveDialog } from "@/components/ResponsiveDialog"

const usageCode = `import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import { Button } from "@/components/ui/button"

export default function ResponsiveDialogDemo() {
  return (
    <ResponsiveDialog
      trigger={<Button variant="outline">Edit profile</Button>}
      title="Edit profile"
      description="Update your details and save."
    >
      <div>Content goes here.</div>
    </ResponsiveDialog>
  )
}`

const formCode = `import { ResponsiveDialog } from "@/components/ResponsiveDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResponsiveDialogForm() {
  return (
    <ResponsiveDialog
      trigger={<Button variant="outline">Edit session</Button>}
      title="Edit session"
      description="Update details for the next session."
      footer={
        <>
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save</Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Input placeholder="Session title" />
        <Input placeholder="Host name" />
      </div>
    </ResponsiveDialog>
  )
}`

export default function ResponsiveDialogPage() {
  const [isDark, setIsDark] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("Edit session")

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
            <h1 className="font-display text-4xl font-semibold">
              Responsive Dialog
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A dialog on desktop and a drawer on mobile using the same API.
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
            Wrap a trigger and content with a single responsive component.
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
            Toggle the open state and update the title.
          </p>
        </div>
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview
            </label>
            <ResponsiveDialog
              open={open}
              onOpenChange={setOpen}
              trigger={<Button variant="outline">Configure dialog</Button>}
              title={title}
              description="Quick updates before you publish."
              footer={
                <>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button onClick={() => setOpen(false)}>Save</Button>
                </>
              }
            >
              <div className="grid gap-4">
                <Field>
                  <FieldLabel htmlFor="responsive-title">Title</FieldLabel>
                  <FieldContent>
                    <Input
                      id="responsive-title"
                      placeholder="Breathwork reset"
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="responsive-location">Location</FieldLabel>
                  <Input id="responsive-location" placeholder="Studio A" />
                </Field>
              </div>
            </ResponsiveDialog>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Title
              </label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
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
          <h2 className="font-display text-2xl font-semibold">Examples</h2>
          <p className="text-sm text-muted-foreground">
            Use for quick edits, confirmations, or lightweight forms.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <ResponsiveDialog
              trigger={<Button variant="outline">Edit session</Button>}
              title="Edit session"
              description="Update the essentials for the next session."
              footer={
                <>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button>Save</Button>
                </>
              }
            >
              <div className="grid gap-4">
                <Input placeholder="Session title" />
                <Input placeholder="Host name" />
              </div>
            </ResponsiveDialog>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ResponsiveDialog
              trigger={<Button variant="outline">Confirm updates</Button>}
              title="Publish updates?"
              description="Attendees will be notified immediately."
              footer={
                <>
                  <DrawerClose asChild>
                    <Button variant="outline">Not yet</Button>
                  </DrawerClose>
                  <Button>Publish</Button>
                </>
              }
            >
              <p className="text-sm text-muted-foreground">
                Keep the message short and clear for mobile users.
              </p>
            </ResponsiveDialog>
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
            ResponsiveDialog wraps Dialog and Drawer with a shared API.
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
                <td className="px-4 py-3 font-medium">trigger</td>
                <td className="px-4 py-3">React.ReactNode</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">title</td>
                <td className="px-4 py-3">string</td>
                <td className="px-4 py-3">—</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">description</td>
                <td className="px-4 py-3">string</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">open</td>
                <td className="px-4 py-3">boolean</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">onOpenChange</td>
                <td className="px-4 py-3">function</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">footer</td>
                <td className="px-4 py-3">React.ReactNode</td>
                <td className="px-4 py-3">undefined</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">contentClassName</td>
                <td className="px-4 py-3">string</td>
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
            Responsive overlays should remain keyboard and screen-reader friendly.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Always provide a title and concise description.</li>
          <li>Keep focusable actions visible on mobile.</li>
          <li>Use the trigger button label to convey intent.</li>
          <li>Ensure cancel actions close the overlay.</li>
        </ul>
      </section>
    </div>
  )
}
