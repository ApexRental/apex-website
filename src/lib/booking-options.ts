/**
 * Shared options for the booking flow: delivery areas (NY & NJ only — Apex is
 * delivery-only) and pickup/return times. Used by the hero search bar, the
 * booking modal, and validated on the server.
 */

export type AreaGroup = { group: string; areas: string[] };

export const DELIVERY_AREAS: AreaGroup[] = [
  {
    group: "New York",
    areas: [
      "Manhattan",
      "Brooklyn",
      "Queens",
      "Bronx",
      "Staten Island",
      "Long Island",
    ],
  },
  {
    group: "New Jersey",
    areas: [
      "Jersey City",
      "Newark",
      "Hoboken",
      "Weehawken",
      "Elizabeth",
      "Other (New Jersey)",
    ],
  },
];

/** Flat list of every valid delivery area (for server-side validation). */
export const ALL_AREAS: string[] = DELIVERY_AREAS.flatMap((g) => g.areas);

export type DropdownOption = { value: string; label: string };
export type DropdownGroup = { label?: string; options: DropdownOption[] };

/** Area groups shaped for the custom <Dropdown>. */
export const AREA_GROUPS: DropdownGroup[] = DELIVERY_AREAS.map((g) => ({
  label: g.group,
  options: g.areas.map((a) => ({ value: a, label: a })),
}));

export const DEFAULT_PICKUP_AREA = "Manhattan";

/** Sentinel used in the drop-off selector to mirror the pickup location. */
export const SAME_AS_PICKUP = "__same__";

/** Operating window for pickups/returns, in 30-minute steps. */
function buildTimes(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let h = 8; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break; // stop at 22:00
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      out.push({ value, label: formatTime(value) });
    }
  }
  return out;
}

/** "08:00" -> "8:00 AM", "13:30" -> "1:30 PM". */
export function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export const TIME_OPTIONS = buildTimes();

/** Time options shaped for the custom <Dropdown> (single, unlabelled group). */
export const TIME_GROUPS: DropdownGroup[] = [{ options: TIME_OPTIONS }];

export const DEFAULT_TIME = "10:00";

/**
 * Today's date (YYYY-MM-DD) in New York, where the business operates. Using UTC
 * here would roll over to "tomorrow" at 8pm EDT and block same-day bookings.
 */
export function todayNY(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Add `n` days to a YYYY-MM-DD string (calendar math, DST-safe). */
export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Is this a valid "HH:MM" within the allowed set? */
export function isValidTime(v: string): boolean {
  return TIME_OPTIONS.some((t) => t.value === v);
}
