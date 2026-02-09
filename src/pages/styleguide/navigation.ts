export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Foundation",
    items: [
      { name: "Design Tokens", href: "/styleguide#design-tokens" },
      { name: "Color Scales", href: "/styleguide#color-scales" },
      { name: "Semantic Colors", href: "/styleguide#semantic-colors" },
      { name: "Typography", href: "/styleguide#typography" },
      { name: "Radius", href: "/styleguide#radius" },
      { name: "Shadows", href: "/styleguide#shadows" },
    ],
  },
  {
    title: "Components",
    items: [
      { name: "Checkbox", href: "/styleguide/components/checkbox" },
      { name: "UI Components", href: "/styleguide#components" },
      { name: "Dialog", href: "/styleguide/components/dialog" },
      { name: "Drawer", href: "/styleguide/components/drawer" },
      { name: "Field", href: "/styleguide/components/field" },
      { name: "Input", href: "/styleguide/components/input" },
      {
        name: "Responsive Dialog",
        href: "/styleguide/components/responsive-dialog",
      },
      { name: "Select", href: "/styleguide/components/select" },
      { name: "Scroll Area", href: "/styleguide/components/scroll-area" },
      { name: "Textarea", href: "/styleguide/components/textarea" },
    ],
  },
]
