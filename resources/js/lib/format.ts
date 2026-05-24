/**
 * Format a number or numeric string to IDR currency.
 */
export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value))
}

/**
 * Format an ISO date string to a localized Indonesian date string.
 *
 * @param dateStr ISO date string.
 * @param monthFormat Month representation format ('long' or 'short').
 */
export function formatDate(dateStr: string | null, monthFormat: "long" | "short" = "long"): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
  })
}

/**
 * Format an ISO date string to include full weekday name.
 */
export function formatDateWithDay(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}
