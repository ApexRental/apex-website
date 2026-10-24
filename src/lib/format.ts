import { DEFAULT_TAXES, formatPercent, type TaxRate } from "./taxes";

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
 * Quote from a subtotal and already-computed tax lines (e.g. lines stored on a
 * booking). The grand total is subtotal + the lines, so the numbers shown
 * always add up exactly. `dailyRate` is the average per day.
 */
export function quoteFromLines(subtotal: number, days: number, lines: QuoteLine[]): Quote {
  const taxTotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const total = round2(subtotal + taxTotal);
  const dailyRate = days > 0 ? round2(subtotal / days) : 0;
  return { dailyRate, days, subtotal, lines, taxTotal, total };
}

/**
 * Build a full price breakdown from a rental subtotal (before tax): each tax
 * is a percentage of the subtotal, rounded to cents per line.
 */
export function quoteFromSubtotal(subtotal: number, days: number, taxes: TaxRate[] = DEFAULT_TAXES): Quote {
  const lines: QuoteLine[] = taxes.map((t) => ({
    label: t.label,
    note: formatPercent(t.rate),
    amount: round2((subtotal * t.rate) / 100),
  }));
  return quoteFromLines(subtotal, days, lines);
}

/** Quote for a flat daily rate (every day the same price). */
export function computeQuote(dailyRate: number, days: number, taxes: TaxRate[] = DEFAULT_TAXES): Quote {
  return { ...quoteFromSubtotal(round2(dailyRate * days), days, taxes), dailyRate };
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
