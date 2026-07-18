export function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function dateShort(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// ---------- pricing (taxes & fees) ----------

/** Taxes and fees applied on top of the rental subtotal, in display order. */
export const TAX_LINES = [
  { label: "NYC sales tax", note: "8.875%", rate: 0.08875 },
  { label: "NY rental tax", note: "12%", rate: 0.12 },
  { label: "Service charge", note: "5.9%", rate: 0.059 },
] as const;

/** Combined tax + fee rate (0.26775). */
export const TAX_RATE_TOTAL = TAX_LINES.reduce((s, t) => s + t.rate, 0);

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type QuoteLine = { label: string; note: string; amount: number };
export type Quote = {
  dailyRate: number;
  days: number;
  subtotal: number;
  lines: QuoteLine[];
  taxTotal: number;
  total: number;
};

/**
 * Build a full price breakdown from a daily rate and number of days.
 * Each tax/fee line is rounded to cents; the grand total is subtotal + the
 * rounded lines, so the numbers shown always add up exactly.
 */
export function computeQuote(dailyRate: number, days: number): Quote {
  const subtotal = round2(dailyRate * days);
  const lines: QuoteLine[] = TAX_LINES.map((t) => ({
    label: t.label,
    note: t.note,
    amount: round2(subtotal * t.rate),
  }));
  const taxTotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const total = round2(subtotal + taxTotal);
  return { dailyRate, days, subtotal, lines, taxTotal, total };
}

export const CATEGORIES = [
  "ECONOMY",
  "SEDAN",
  "SUV",
  "ELECTRIC",
  "PREMIUM",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Economy",
  SEDAN: "Sedan",
  SUV: "SUV",
  ELECTRIC: "Electric",
  PREMIUM: "Premium",
};

export const BOOKING_STATUSES = [
  "NEW",
  "CONFIRMED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
