import { Navigate, createBrowserRouter } from "react-router-dom";

import { styleguideRoutes } from "@/routes/styleguide";
import RegisterPage from "@/pages/register/page";
import LoginPage from "@/pages/login/page";
import VerifyEmailPage from "@/pages/verify-email/page";
import ProtectedRoute from "@/routes/ProtectedRoute";
import MePage from "@/pages/me/page";

const isDev = import.meta.env.VITE_ENV === "dev";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/me" replace />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/me",
        element: <MePage />,
      },
    ],
  },
  ...(isDev ? styleguideRoutes : []),
]);

export default router;
