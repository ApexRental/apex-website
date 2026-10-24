/**
 * Per-day pricing core. Pure functions shared by the browser and the server so
 * the price a customer sees is exactly the price the API charges.
 *
 * Dates are always "YYYY-MM-DD" strings (calendar days, no time of day).
 * A rental from start to end bills every day in [start, end): the return day
 * is never billed.
 */
import { addDays } from "./booking-options";
import { quoteFromSubtotal, round2, type Quote } from "./format";
import { DEFAULT_TAXES, type TaxRate } from "./taxes";

/** Custom price per calendar day; days not in the map use the base rate. */
export type RateMap = Record<string, number>;
export type Night = { date: string; price: number };
export type PriceGroup = { price: number; count: number };

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const MAX_RANGE_DAYS = 366;
const MAX_DAYS_AHEAD = 365;
const MIN_PRICE = 1;
const MAX_PRICE = 10_000;

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const weekdayOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

/** Every billable day from startDate (inclusive) to endDate (exclusive). */
export function billableDates(startDate: string, endDate: string): string[] {
  if (!isDate(startDate) || !isDate(endDate) || endDate <= startDate) return [];
  const out: string[] = [];
  for (let d = startDate; d < endDate; d = addDays(d, 1)) out.push(d);
  return out;
}

/** The price of each billable day: its custom price, else the base rate. */
export function nightlyRates(base: number, rates: RateMap, startDate: string, endDate: string): Night[] {
  return billableDates(startDate, endDate).map((date) => ({ date, price: rates[date] ?? base }));
}

/** Days grouped by price, in order of first appearance. */
export function groupNights(nights: Night[]): PriceGroup[] {
  const counts = new Map<number, number>();
  for (const n of nights) counts.set(n.price, (counts.get(n.price) ?? 0) + 1);
  return [...counts].map(([price, count]) => ({ price, count }));
}

/** Taxed quote for a set of nights; `dailyRate` is the average per day. */
export function quoteFromNights(nights: Night[], taxes: TaxRate[] = DEFAULT_TAXES): Quote {
  const subtotal = round2(nights.reduce((s, n) => s + n.price, 0));
  return quoteFromSubtotal(subtotal, nights.length, taxes);
}

/** Price to show on a car card: the average for chosen dates, else the base. */
export function displayRate(
  base: number,
  rates: RateMap,
  startDate: string,
  endDate: string
): { price: number; isAverage: boolean } {
  const nights = nightlyRates(base, rates, startDate, endDate);
  if (nights.length === 0) return { price: base, isAverage: false };
  return { price: quoteFromNights(nights).dailyRate, isAverage: true };
}

/** Every day from `from` to `to` (both inclusive) whose weekday (0 = Sun) is listed. */
export function expandRange(from: string, to: string, weekdays: number[]): string[] {
  if (!isDate(from) || !isDate(to) || to < from) return [];
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (weekdays.includes(weekdayOf(d))) out.push(d);
  }
  return out;
}

/**
 * Validate an admin price change and work out which days it touches.
 * `price` omitted = a reset to the base rate. Days before `today` are dropped.
 */
export function planRateChange(
  input: { from: string; to: string; weekdays: number[]; price?: number },
  today: string
): { dates: string[]; price?: number } | { error: string } {
  const { from, to } = input;
  if (!isDate(from) || !isDate(to)) return { error: "Pick valid start and end dates." };
  if (to < from) return { error: "End date must be on or after the start date." };
  if (expandRange(from, to, ALL_WEEKDAYS).length > MAX_RANGE_DAYS) {
    return { error: "Pick a range of 366 days or less." };
  }

  const weekdays = input.weekdays.filter((w) => ALL_WEEKDAYS.includes(w));
  if (weekdays.length === 0) return { error: "Select at least one day of the week." };

  let price: number | undefined;
  if (input.price !== undefined) {
    if (!Number.isFinite(input.price) || input.price < MIN_PRICE || input.price > MAX_PRICE) {
      return { error: "Price must be between $1 and $10,000." };
    }
    price = round2(input.price);
  }

  const dates = expandRange(from, to, weekdays);
  if (dates.length === 0) return { error: "No days in that range match the selected weekdays." };
  const lastAllowed = addDays(today, MAX_DAYS_AHEAD);
  if (dates.some((d) => d > lastAllowed)) return { error: "Prices can be set up to one year ahead." };

  const upcoming = dates.filter((d) => d >= today);
  if (upcoming.length === 0) return { error: "All selected days are in the past." };

  return price === undefined ? { dates: upcoming } : { dates: upcoming, price };
}
