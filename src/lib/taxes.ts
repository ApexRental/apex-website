/**
 * Taxes & fees applied to every new booking, as a percentage of the rental
 * subtotal. Edited in Settings (stored as the "taxes" Setting); the defaults
 * below apply until the admin saves their own list.
 */

/** One tax or fee: `rate` is a percentage of the rental subtotal (8.875 = 8.875%). */
export type TaxRate = { label: string; rate: number };

export const DEFAULT_TAXES: TaxRate[] = [
  { label: "NYC sales tax", rate: 8.875 },
  { label: "NY rental tax", rate: 12 },
  { label: "Service charge", rate: 5.9 },
];

const MAX_TAXES = 10;
const MAX_LABEL = 40;

/** 8.875 -> "8.875%", 12 -> "12%". */
export function formatPercent(rate: number): string {
  return `${Number(rate.toFixed(3))}%`;
}

/** Validate and normalise an edited tax list (names trimmed, rates to 3 decimals). */
export function validateTaxes(
  rows: { label: string; rate: number }[]
): { taxes: TaxRate[] } | { error: string } {
  if (rows.length > MAX_TAXES) return { error: "Up to 10 taxes." };
  const labels = rows.map((r) => (typeof r.label === "string" ? r.label.trim() : ""));
  if (labels.some((l) => l.length === 0 || l.length > MAX_LABEL)) {
    return { error: "Each tax needs a name (up to 40 characters)." };
  }
  if (rows.some((r) => typeof r.rate !== "number" || !Number.isFinite(r.rate) || r.rate < 0 || r.rate > 100)) {
    return { error: "Each rate must be between 0% and 100%." };
  }
  return { taxes: rows.map((r, i) => ({ label: labels[i], rate: Math.round(r.rate * 1000) / 1000 })) };
}

/** Read the stored setting; anything missing or invalid falls back to the defaults. */
export function parseStoredTaxes(json: string | undefined): TaxRate[] {
  if (json === undefined) return DEFAULT_TAXES;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return DEFAULT_TAXES;
  }
  if (!Array.isArray(parsed)) return DEFAULT_TAXES;
  const result = validateTaxes(parsed as { label: string; rate: number }[]);
  return "error" in result ? DEFAULT_TAXES : result.taxes;
}

/** "A (1%), B (2%) and C (3%)" — for customer-facing copy; "" when there are none. */
export function describeTaxes(taxes: TaxRate[]): string {
  const parts = taxes.map((t) => `${t.label} (${formatPercent(t.rate)})`);
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}
