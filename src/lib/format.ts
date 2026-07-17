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
