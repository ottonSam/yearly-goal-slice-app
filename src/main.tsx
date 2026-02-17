import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import router from "./routes"
import { AuthProvider } from "@/contexts/auth"

const queryClient = new QueryClient()

function disableMobileZoom() {
  if (typeof window === "undefined" || !("ontouchstart" in window)) {
    return
  }

  let lastTouchEnd = 0

  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    { passive: false }
  )

  document.addEventListener(
    "gesturestart",
    (event) => {
      event.preventDefault()
    },
    { passive: false }
  )
}

disableMobileZoom()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
