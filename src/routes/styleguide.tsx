import type { RouteObject } from "react-router-dom"

import StyleguideLayout from "@/pages/styleguide/layout"
import CheckboxPage from "@/pages/styleguide/components/checkbox/page"
import DialogPage from "@/pages/styleguide/components/dialog/page"
import DrawerPage from "@/pages/styleguide/components/drawer/page"
import FieldPage from "@/pages/styleguide/components/field/page"
import InputPage from "@/pages/styleguide/components/input/page"
import ResponsiveDialogPage from "@/pages/styleguide/components/responsive-dialog/page"
import ScrollAreaPage from "@/pages/styleguide/components/scroll-area/page"
import SelectPage from "@/pages/styleguide/components/select/page"
import TextareaPage from "@/pages/styleguide/components/textarea/page"
import StyleguidePage from "@/pages/styleguide/page"

export const styleguideRoutes: RouteObject[] = [
  {
    path: "/styleguide",
    element: <StyleguideLayout />,
    children: [
      {
        index: true,
        element: <StyleguidePage />,
      },
      {
        path: "components/checkbox",
        element: <CheckboxPage />,
      },
      {
        path: "components/dialog",
        element: <DialogPage />,
      },
      {
        path: "components/drawer",
        element: <DrawerPage />,
      },
      {
        path: "components/field",
        element: <FieldPage />,
      },
      {
        path: "components/input",
        element: <InputPage />,
      },
      {
        path: "components/responsive-dialog",
        element: <ResponsiveDialogPage />,
      },
      {
        path: "components/select",
        element: <SelectPage />,
      },
      {
        path: "components/scroll-area",
        element: <ScrollAreaPage />,
      },
      {
        path: "components/textarea",
        element: <TextareaPage />,
      },
    ],
  },
]
