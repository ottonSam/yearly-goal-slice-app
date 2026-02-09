import * as React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const tags = Array.from({ length: 40 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)

const usageCode = `import { ScrollArea } from "@/components/ui/scroll-area"

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-72 w-56 rounded-md border">
      <div className="p-4">Scrollable content</div>
    </ScrollArea>
  )
}`

const horizontalCode = `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function HorizontalScroll() {
  return (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {items.map((item) => (
          <div key={item} className="w-40 shrink-0 rounded-lg border p-4">
            {item}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}`

export default function ScrollAreaPage() {
  const [isDark, setIsDark] = React.useState(false)

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
            <h1 className="font-display text-4xl font-semibold">Scroll Area</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Styled overflow containers with custom scrollbars.
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
            Wrap content inside ScrollArea to style overflow.
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
          <h2 className="font-display text-2xl font-semibold">Vertical</h2>
          <p className="text-sm text-muted-foreground">
            A list of tags inside a fixed-height container.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <ScrollArea className="h-72 w-60 rounded-md border border-border bg-background">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium">Tags</h4>
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="border-b border-border py-2 text-sm last:border-none"
                >
                  {tag}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Horizontal</h2>
          <p className="text-sm text-muted-foreground">
            Use ScrollBar orientation for horizontal galleries.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border bg-background">
            <div className="flex w-max gap-4 p-4">
              {["Morning", "Noon", "Evening", "Night", "Weekend"].map((slot) => (
                <div
                  key={slot}
                  className="w-48 shrink-0 rounded-lg border border-border bg-card p-4"
                >
                  <p className="text-sm font-semibold">{slot}</p>
                  <p className="text-xs text-muted-foreground">
                    Session options
                  </p>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <pre className="overflow-x-auto text-sm text-foreground">
            <code>{horizontalCode}</code>
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Props</h2>
          <p className="text-sm text-muted-foreground">
            ScrollArea is a thin wrapper around Radix Scroll Area.
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
                <td className="px-4 py-3 font-medium">ScrollArea</td>
                <td className="px-4 py-3">type, scrollHideDelay</td>
                <td className="px-4 py-3">"hover", 600</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium">ScrollBar</td>
                <td className="px-4 py-3">orientation</td>
                <td className="px-4 py-3">"vertical"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Accessibility</h2>
          <p className="text-sm text-muted-foreground">
            Ensure scrollable regions are discoverable and labeled.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>Provide context headers for scrollable content.</li>
          <li>Keep focusable elements within the viewport.</li>
          <li>Use `ScrollBar` for horizontal scroll affordance.</li>
          <li>Ensure content has sufficient contrast.</li>
        </ul>
      </section>
    </div>
  )
}
