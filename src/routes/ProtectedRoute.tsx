import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/contexts/use-auth"

interface ProtectedRouteProps {
  redirectTo?: string
}

export default function ProtectedRoute({
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
