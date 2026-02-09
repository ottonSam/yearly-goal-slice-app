import { Navigate, createBrowserRouter } from "react-router-dom"

import { styleguideRoutes } from "@/routes/styleguide"
import RegisterPage from "@/pages/register/page"

const isDev = import.meta.env.VITE_ENV === "dev"

const baseRoutes = isDev
  ? [
      {
        path: "/",
        element: <Navigate to="/styleguide" replace />,
      },
    ]
  : []

const router = createBrowserRouter([
  ...baseRoutes,
  {
    path: "/register",
    element: <RegisterPage />,
  },
  ...(isDev ? styleguideRoutes : []),
])

export default router
