import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const baseTokens = [
  { name: "--background", label: "Background" },
  { name: "--foreground", label: "Foreground" },
  { name: "--card", label: "Card" },
  { name: "--card-foreground", label: "Card Foreground" },
  { name: "--popover", label: "Popover" },
  { name: "--popover-foreground", label: "Popover Foreground" },
  { name: "--primary", label: "Primary" },
  { name: "--primary-foreground", label: "Primary Foreground" },
  { name: "--secondary", label: "Secondary" },
  { name: "--secondary-foreground", label: "Secondary Foreground" },
  { name: "--muted", label: "Muted" },
  { name: "--muted-foreground", label: "Muted Foreground" },
  { name: "--accent", label: "Accent" },
  { name: "--accent-foreground", label: "Accent Foreground" },
  { name: "--border", label: "Border" },
  { name: "--input", label: "Input" },
  { name: "--ring", label: "Ring" },
]

const semanticTokens = [
  { name: "--success", label: "Success" },
  { name: "--warning", label: "Warning" },
  { name: "--info", label: "Info" },
  { name: "--destructive", label: "Destructive" },
]

const brandScale = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
]

const neutralScale = [...brandScale]

function ColorSwatch({ name, label }: { name: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className="h-12 w-12 rounded-md border border-border"
        style={{ backgroundColor: `var(${name})` }}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{name}</p>
      </div>
    </div>
  )
}

function ScaleSwatch({ name }: { name: string }) {
  const label = name.replace("--", "")
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div
        className="h-12 w-12 rounded-md border border-border"
        style={{ backgroundColor: `var(${name})` }}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{name}</p>
      </div>
    </div>
  )
}

export default function StyleguidePage() {
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
              Styleguide
            </p>
            <h1 className="font-display text-4xl font-semibold">
              Soul Therapy Design System
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Soft, grounded, and botanical. Balanced warm neutrals with restorative
              greens and airy spacing.
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

      <section id="design-tokens" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Design Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Core UI tokens applied across the system.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {baseTokens.map((token) => (
            <ColorSwatch key={token.name} {...token} />
          ))}
        </div>
      </section>

      <section id="color-scales" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Color Scales</h2>
          <p className="text-sm text-muted-foreground">
            Brand olive and warm neutral ramps.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Brand
            </h3>
            <div className="grid gap-3">
              {brandScale.map((step) => (
                <ScaleSwatch key={step} name={`--brand-${step}`} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Neutral
            </h3>
            <div className="grid gap-3">
              {neutralScale.map((step) => (
                <ScaleSwatch key={step} name={`--neutral-${step}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="semantic-colors" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Semantic Colors</h2>
          <p className="text-sm text-muted-foreground">
            Status states with accessible contrast.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {semanticTokens.map((token) => (
            <ColorSwatch key={token.name} {...token} />
          ))}
        </div>
      </section>

      <section id="typography" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Typography</h2>
          <p className="text-sm text-muted-foreground">
            Serif display with calm sans-serif body text.
          </p>
        </div>
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Display
            </p>
            <p className="font-display text-4xl font-semibold">Healing begins</p>
            <p className="font-display text-3xl">When we create space</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Body
            </p>
            <p className="text-base">
              Therapy that honors the whole person, rooted in warmth and steady
              guidance.
            </p>
            <p className="text-sm text-muted-foreground">
              Smaller supporting copy for captions and metadata.
            </p>
          </div>
        </div>
      </section>

      <section id="radius" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Radius</h2>
          <p className="text-sm text-muted-foreground">
            Soft, rounded corners that feel approachable.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Rounded sm", className: "rounded-sm" },
            { label: "Rounded md", className: "rounded-md" },
            { label: "Rounded lg", className: "rounded-lg" },
            { label: "Rounded xl", className: "rounded-xl" },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex h-24 items-center justify-center border border-border bg-card ${item.className}`}
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="shadows" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Shadows</h2>
          <p className="text-sm text-muted-foreground">
            Subtle depth that keeps the UI airy.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Shadow sm", className: "shadow-sm" },
            { label: "Shadow", className: "shadow" },
            { label: "Shadow md", className: "shadow-md" },
            { label: "Shadow lg", className: "shadow-lg" },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex h-24 items-center justify-center rounded-lg border border-border bg-card ${item.className}`}
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="components" className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Components</h2>
          <p className="text-sm text-muted-foreground">
            Shadcn primitives styled with the new tokens.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Appointment</CardTitle>
              <CardDescription>Guided sessions for deeper clarity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>New</Badge>
                <Badge variant="secondary">Mindful</Badge>
                <Badge variant="outline">45 min</Badge>
                <Badge variant="success">Available</Badge>
              </div>
              <RadioGroup>
                <RadioGroupItem name="session" id="in-person" label="In person" />
                <RadioGroupItem name="session" id="online" label="Online" />
                <RadioGroupItem name="session" id="flex" label="Flexible" />
              </RadioGroup>
            </CardContent>
            <CardFooter className="gap-3">
              <Button>Book now</Button>
              <Button variant="outline">Details</Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <Alert>
              <AlertTitle>Warm welcome</AlertTitle>
              <AlertDescription>
                This space is designed for gentle pacing and reflective care.
              </AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>Confirmed</AlertTitle>
              <AlertDescription>
                Your intake form has been saved successfully.
              </AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Reminder</AlertTitle>
              <AlertDescription>
                Sessions fill quickly during seasonal transitions.
              </AlertDescription>
            </Alert>
            <Alert variant="info">
              <AlertTitle>Resources</AlertTitle>
              <AlertDescription>
                Browse wellness materials curated for calm focus.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    </div>
  )
}
