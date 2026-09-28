export function formatCurrency(minorUnits: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(minorUnits / 100);
}

export function formatSignedCurrency(
  minorUnits: number,
  type: "transfer_out" | "transfer_in" | "recharge" | "unknown",
  currency = "MXN",
): string {
  const formatted = formatCurrency(minorUnits, currency);
  if (type === "transfer_out") return `- ${formatted}`;
  return `+ ${formatted}`;
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}
