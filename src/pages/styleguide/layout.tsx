import { Link, Outlet, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"
import { navigation } from "./navigation"

export default function StyleguideLayout() {
  const location = useLocation()
  const currentPathWithHash =
    location.pathname === "/styleguide" && !location.hash
      ? "/styleguide#design-tokens"
      : `${location.pathname}${location.hash}`

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col gap-6 overflow-y-auto border-r border-border bg-sidebar p-6">
        <div>
          <Link
            to="/styleguide#design-tokens"
            className="font-display text-xl font-semibold"
          >
            Design System
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Soul-inspired foundation
          </p>
        </div>

        <nav className="flex flex-col gap-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {section.title}
              </h3>
              <ul className="mt-2 flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-colors",
                        currentPathWithHash === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 pl-64">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
