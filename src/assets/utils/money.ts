const brlCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrencyBRL(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return brlCurrencyFormatter.format(amount);
}

export function normalizeMoneyInput(value: string) {
  return value.trim().replace(",", ".");
}
