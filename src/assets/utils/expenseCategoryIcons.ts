import {
  BookOpen,
  Bus,
  Car,
  Clapperboard,
  Dumbbell,
  HeartPulse,
  House,
  Plane,
  ShieldPlus,
  ShoppingCart,
  Ticket,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface ExpenseCategoryIconOption {
  value: string;
  label: string;
  Icon: LucideIcon;
}

const EXPENSE_CATEGORY_ICON_OPTIONS: ExpenseCategoryIconOption[] = [
  { value: "mdi:food", label: "Alimentação", Icon: UtensilsCrossed },
  { value: "mdi:cart", label: "Compras", Icon: ShoppingCart },
  { value: "mdi:movie-open", label: "Lazer", Icon: Clapperboard },
  { value: "mdi:dumbbell", label: "Academia", Icon: Dumbbell },
  { value: "mdi:shield-plus", label: "Saúde", Icon: ShieldPlus },
  { value: "mdi:car", label: "Carro", Icon: Car },
  { value: "mdi:bus", label: "Transporte", Icon: Bus },
  { value: "mdi:home", label: "Casa", Icon: House },
  { value: "mdi:book-open-variant", label: "Estudos", Icon: BookOpen },
  { value: "mdi:airplane", label: "Viagem", Icon: Plane },
  { value: "mdi:wrench", label: "Serviços", Icon: Wrench },
  { value: "mdi:heart-pulse", label: "Bem-estar", Icon: HeartPulse },
  { value: "mdi:ticket-percent", label: "Assinaturas", Icon: Ticket },
];

const DEFAULT_EXPENSE_CATEGORY_ICON = EXPENSE_CATEGORY_ICON_OPTIONS[0];
const iconOptionByName = new Map(
  EXPENSE_CATEGORY_ICON_OPTIONS.map((option) => [option.value, option]),
);

export function listExpenseCategoryIconOptions() {
  return EXPENSE_CATEGORY_ICON_OPTIONS;
}

export function getExpenseCategoryIconOptionByName(iconName?: string | null) {
  if (!iconName) {
    return DEFAULT_EXPENSE_CATEGORY_ICON;
  }

  return iconOptionByName.get(iconName) ?? DEFAULT_EXPENSE_CATEGORY_ICON;
}

export function getExpenseCategoryIconByName(iconName?: string | null) {
  return getExpenseCategoryIconOptionByName(iconName).Icon;
}
