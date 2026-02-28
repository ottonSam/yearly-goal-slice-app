import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/use-auth";
import { cn } from "@/lib/utils";
import logoGator from "@/assets/img/logogator.png";

const navigationItems = [
  {
    name: "Objetivos",
    href: "/objectives",
  },
  {
    name: "Carteiras",
    href: "/wallets",
  },
  {
    name: "Meu perfil",
    href: "/me",
  },
  {
    name: "Calendários",
    href: "/goal-calendars",
  },
];

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName = fullName || user?.username || "Usuário";
  const usernameLabel = user?.username
    ? `@${user.username}`
    : user?.email
      ? user.email
      : "";

  const isNavigationItemActive = (href: string) => {
    if (href === "/objectives") {
      return location.pathname.startsWith("/objectives");
    }

    if (href === "/goal-calendars") {
      return location.pathname.startsWith("/goal-calendars");
    }

    if (href === "/wallets") {
      return location.pathname.startsWith("/wallets");
    }

    return location.pathname === href;
  };

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed left-0 top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Abrir menu">
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </DrawerTrigger>
            <DrawerContent
              position="left"
              className="h-full w-80 max-w-[85vw] gap-6 px-6 py-8"
            >
              <div className="space-y-1">
                <p className="text-lg font-semibold">{displayName}</p>
                {usernameLabel ? (
                  <p className="text-sm text-muted-foreground">
                    {usernameLabel}
                  </p>
                ) : null}
              </div>

              <div className="h-px w-full bg-border" />

              <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <DrawerClose key={item.href} asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isNavigationItemActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {item.name}
                    </Link>
                  </DrawerClose>
                ))}
              </nav>

              <div className="mt-auto pt-2">
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full justify-start"
                  >
                    Logout
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>

          <div className="flex flex-1 items-center justify-center">
            <Link to="/objectives" className="flex items-center justify-center">
              <img
                src={logoGator}
                alt="Yearly Goal"
                className="h-11 w-auto"
              />
            </Link>
          </div>

          <ThemeSwitch />
        </div>
      </header>

      <main className="h-screen overflow-y-auto pt-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
