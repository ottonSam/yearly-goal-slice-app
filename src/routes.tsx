import { Navigate, createBrowserRouter } from "react-router-dom";

import { styleguideRoutes } from "@/routes/styleguide";
import RegisterPage from "@/pages/register/page";
import LoginPage from "@/pages/login/page";
import VerifyEmailPage from "@/pages/verify-email/page";
import ProtectedRoute from "@/routes/ProtectedRoute";
import MePage from "@/pages/me/page";
import AppLayout from "@/layouts/AppLayout";
import PublicLayout from "@/layouts/PublicLayout";
import GoalCalendarFormPage from "@/pages/goal-calendar-form/page";
import GoalCalendarsPage from "@/pages/goal-calendars/page";
import GoalCalendarDetailsPage from "@/pages/goal-calendar-details/page";
import ObjectivesHomePage from "@/pages/objectives/page";
import ObjectiveFormPage from "@/pages/objective-form/page";
import WalletsPage from "@/pages/wallets/page";
import WalletFormPage from "@/pages/wallet-form/page";
import WalletCyclePage from "@/pages/wallet-cycle/page";

const isDev = import.meta.env.VITE_ENV === "dev";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/objectives" replace />,
  },
  {
    element: <PublicLayout />,
    children: [
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
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/me",
            element: <MePage />,
          },
          {
            path: "/objectives",
            element: <ObjectivesHomePage />,
          },
          {
            path: "/objectives/new",
            element: <ObjectiveFormPage />,
          },
          {
            path: "/objectives/edit/:objectiveId",
            element: <ObjectiveFormPage />,
          },
          {
            path: "/goal-calendars",
            element: <GoalCalendarsPage />,
          },
          {
            path: "/goal-calendars/new",
            element: <GoalCalendarFormPage />,
          },
          {
            path: "/goal-calendars/edit/:goalCalendarId",
            element: <GoalCalendarFormPage />,
          },
          {
            path: "/goal-calendars/:goalCalendarId",
            element: <GoalCalendarDetailsPage />,
          },
          {
            path: "/wallets",
            element: <WalletsPage />,
          },
          {
            path: "/wallets/new",
            element: <WalletFormPage />,
          },
          {
            path: "/wallets/edit/:walletId",
            element: <WalletFormPage />,
          },
          {
            path: "/wallets/:walletId/cycle",
            element: <WalletCyclePage />,
          },
        ],
      },
    ],
  },
  ...(isDev ? styleguideRoutes : []),
]);

export default router;
