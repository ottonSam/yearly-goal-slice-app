import { Outlet } from "react-router-dom"

import { ThemeSwitch } from "@/components/ThemeSwitch"

export default function PublicLayout() {
  return (
    <div className="relative">
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <ThemeSwitch />
      </div>
      <Outlet />
    </div>
  )
}
