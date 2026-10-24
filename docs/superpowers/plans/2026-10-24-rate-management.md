# Rate Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-car, per-day prices set from an admin calendar, charged and shown consistently on the site, in the booking API, emails and admin views.

**Architecture:** A pure pricing core (`src/lib/pricing.ts`) turns a base rate + a `RateMap` (date → price) into billable nights and a taxed quote; the browser and the server both use it. Custom prices live in a new `CarRate` table; bookings store their own subtotal and per-day breakdown so old bookings never change.

**Tech Stack:** Next.js 16.2 (App Router), React 19, TypeScript 5, Prisma 6 (Neon Postgres), Zod 4, Node built-in test runner via `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-24-rate-management-design.md`

## Global Constraints

- No new runtime dependencies. Tests: `node --import tsx --test` (tsx is already a devDependency).
- Dates are `"YYYY-MM-DD"` strings everywhere in pricing; "today" is `todayNY()` from `src/lib/booking-options.ts`.
- Billable days are `[startDate, endDate)`; the return day is never billed.
- Taxes stay exactly as `TAX_LINES` in `src/lib/format.ts` (8.875%, 12%, 5.9%), computed on the subtotal.
- Custom price limits: $1–$10,000, rounded to cents; range ≤ 366 days; ≥ 1 weekday; only dates from today to today + 365.
- The Neon database is shared with the live site: schema changes are additive only (`prisma db push`), and any test data is deleted right after use.
- Existing bookings are never recalculated. Admin UI copy is English.
- Do not deploy as part of this plan.

## Review Focus

1. A rental crossing a month end and the DST change (31 Oct → 3 Nov 2026) bills exactly 3 days. Test: Task 1.
2. A custom price on the return date never changes the total. Test: Task 1.
3. A car with no custom prices prices exactly like today's `computeQuote`. Test: Task 1.
4. An admin range that starts in the past saves only today and later and reports only those days; a range entirely in the past is rejected. Test: Task 1 (`planRateChange`).
5. A custom price more than 365 days ahead is rejected, so the site's 365-day rate window can never disagree with what the server charges. Test: Task 1 (`planRateChange`).

---

### Task 1: Pricing core

**Files:**
- Create: `src/lib/pricing.ts`, `src/lib/pricing.test.ts`
- Modify: `src/lib/format.ts` (add `quoteFromSubtotal`, make `computeQuote` a wrapper), `package.json` (add `"test": "node --import tsx --test \"src/**/*.test.ts\""`)

**Interfaces:**
- Produces (in `pricing.ts`):
  - `type RateMap = Record<string, number>`
  - `type Night = { date: string; price: number }`
  - `type PriceGroup = { price: number; count: number }`
  - `billableDates(startDate: string, endDate: string): string[]`
  - `nightlyRates(base: number, rates: RateMap, startDate: string, endDate: string): Night[]`
  - `groupNights(nights: Night[]): PriceGroup[]` — order of first appearance
  - `quoteFromNights(nights: Night[]): Quote` — `dailyRate` = average rounded to cents, `days` = `nights.length`
  - `displayRate(base: number, rates: RateMap, startDate: string, endDate: string): { price: number; isAverage: boolean }`
  - `expandRange(from: string, to: string, weekdays: number[]): string[]` — inclusive, 0 = Sun … 6 = Sat
  - `planRateChange(input: { from: string; to: string; weekdays: number[]; price?: number }, today: string): { dates: string[]; price?: number } | { error: string }`
- Produces (in `format.ts`): `quoteFromSubtotal(subtotal: number, days: number): Quote`; `computeQuote(dailyRate, days)` keeps its signature and output.

- [ ] **Step 1: Write the failing tests** in `src/lib/pricing.test.ts` (`node:test` + `node:assert/strict`):

```ts
test("billable days exclude the return day", () =>
  assert.deepEqual(billableDates("2026-10-27", "2026-10-30"), ["2026-10-27", "2026-10-28", "2026-10-29"]));
test("month end + DST change bills 3 days", () =>
  assert.deepEqual(billableDates("2026-10-31", "2026-11-03"), ["2026-10-31", "2026-11-01", "2026-11-02"]));
test("same or reversed dates bill nothing", () => {
  assert.deepEqual(billableDates("2026-10-27", "2026-10-27"), []);
  assert.deepEqual(billableDates("2026-10-30", "2026-10-27"), []);
});
test("custom price applies only to its day", () =>
  assert.deepEqual(nightlyRates(100, { "2026-10-28": 150 }, "2026-10-27", "2026-10-30").map((n) => n.price), [100, 150, 100]));
test("price on the return date is ignored", () =>
  assert.equal(quoteFromNights(nightlyRates(100, { "2026-10-30": 999 }, "2026-10-27", "2026-10-30")).total, 380.33));
test("no custom prices equals computeQuote", () =>
  assert.deepEqual(quoteFromNights(nightlyRates(100, {}, "2026-10-27", "2026-10-30")), computeQuote(100, 3)));
test("mixed quote", () => {
  const q = quoteFromNights(nightlyRates(100, { "2026-10-28": 150 }, "2026-10-27", "2026-10-30"));
  assert.equal(q.subtotal, 350); assert.deepEqual(q.lines.map((l) => l.amount), [31.06, 42, 20.65]);
  assert.equal(q.taxTotal, 93.71); assert.equal(q.total, 443.71); assert.equal(q.dailyRate, 116.67); assert.equal(q.days, 3);
});
test("groups keep first-appearance order", () =>
  assert.deepEqual(groupNights([{ date: "a", price: 100 }, { date: "b", price: 150 }, { date: "c", price: 100 }]),
    [{ price: 100, count: 2 }, { price: 150, count: 1 }]));
test("displayRate", () => {
  assert.deepEqual(displayRate(100, { "2026-10-28": 150 }, "", ""), { price: 100, isAverage: false });
  assert.deepEqual(displayRate(100, { "2026-10-28": 150 }, "2026-10-27", "2026-10-30"), { price: 116.67, isAverage: true });
  assert.deepEqual(displayRate(100, {}, "2026-10-30", "2026-10-27"), { price: 100, isAverage: false });
});
test("expandRange weekday filter, inclusive", () => {
  assert.deepEqual(expandRange("2026-12-01", "2026-12-07", [5, 6, 0]), ["2026-12-04", "2026-12-05", "2026-12-06"]);
  assert.equal(expandRange("2026-12-01", "2026-12-03", [0, 1, 2, 3, 4, 5, 6]).length, 3);
  assert.deepEqual(expandRange("2026-12-03", "2026-12-01", [0, 1, 2, 3, 4, 5, 6]), []);
});
test("planRateChange validation", () => {
  const T = "2026-10-24", all = [0, 1, 2, 3, 4, 5, 6];
  assert.deepEqual(planRateChange({ from: "2026-11-02", to: "2026-11-01", weekdays: all, price: 100 }, T), { error: "End date must be on or after the start date." });
  assert.deepEqual(planRateChange({ from: "2026-11-01", to: "2027-11-05", weekdays: all, price: 100 }, T), { error: "Pick a range of 366 days or less." });
  assert.deepEqual(planRateChange({ from: "2026-11-01", to: "2026-11-02", weekdays: [], price: 100 }, T), { error: "Select at least one day of the week." });
  assert.deepEqual(planRateChange({ from: "2026-11-01", to: "2026-11-02", weekdays: all, price: 0 }, T), { error: "Price must be between $1 and $10,000." });
  assert.deepEqual(planRateChange({ from: "2026-11-01", to: "2026-11-02", weekdays: all, price: Number.NaN }, T), { error: "Price must be between $1 and $10,000." });
  assert.deepEqual(planRateChange({ from: "2026-10-20", to: "2026-10-22", weekdays: all, price: 100 }, T), { error: "All selected days are in the past." });
  assert.deepEqual(planRateChange({ from: "2026-10-23", to: "2026-10-25", weekdays: all, price: 99.999 }, T), { dates: ["2026-10-24", "2026-10-25"], price: 100 });
  assert.deepEqual(planRateChange({ from: "2027-10-20", to: "2027-10-30", weekdays: all, price: 100 }, T), { error: "Prices can be set up to one year ahead." });
  assert.deepEqual(planRateChange({ from: "2026-11-01", to: "2026-11-02", weekdays: all }, T), { dates: ["2026-11-01", "2026-11-02"] });
});
```

- [ ] **Step 2: Run `npm test`** — Expected: FAIL, `pricing.ts` exports missing.

- [ ] **Step 3: Implement `pricing.ts` and `quoteFromSubtotal`.** Day math reuses `addDays` from `booking-options.ts`; weekday of a date = `new Date(date + "T00:00:00Z").getUTCDay()`. `planRateChange` checks, in this order: `to ≥ from`, span (`expandRange(from, to, all).length`) ≤ 366, weekdays non-empty, price (when given) finite and 1–10,000 then rounded with `round2`, any date > `addDays(today, 365)` → year-ahead error, drop dates < today, nothing left → past error. When `price` is omitted (reset), skip the price check and return `{ dates }` only.

- [ ] **Step 4: Run `npm test`** — Expected: all tests PASS.

- [ ] **Step 5: Commit** — `git add src/lib/pricing.ts src/lib/pricing.test.ts src/lib/format.ts package.json && git commit -m "feat(pricing): per-day pricing core with tests"`

---

### Task 2: Schema and rate data access

**Files:**
- Modify: `prisma/schema.prisma` (add `CarRate`, `Car.rates`, `Booking.subtotal Float?`, `Booking.rateBreakdown Json?` exactly as in the spec)
- Create: `src/lib/rates.ts`

**Interfaces:**
- Consumes: `RateMap` (Task 1)
- Produces: `getRateMap(carId: string, from: string, to: string): Promise<RateMap>`, `getRateMaps(carIds: string[], from: string, to: string): Promise<Record<string, RateMap>>` — both inclusive of `from` and `to`; map keys are `date.toISOString().slice(0, 10)`. No `server-only` import (it breaks `tsx` scripts).

- [ ] **Step 1: Update the schema and push** — Run: `npx prisma db push` then `npx prisma generate`. Expected: "Your database is now in sync", client generated.
- [ ] **Step 2: Implement `rates.ts`** with one `prisma.carRate.findMany` per call; bounds as `new Date(from + "T00:00:00Z")` / `new Date(to + "T00:00:00Z")` with `gte`/`lte`.
- [ ] **Step 3: Verify against the DB** with a throwaway `_check-rates.ts` in the project root (run `npx tsx _check-rates.ts`, then delete the file): create two `CarRate` rows (2026-12-04 → 150, 2026-12-05 → 160) on the first car, print `getRateMap(car, "2026-12-01", "2026-12-31")` and `getRateMaps([car], "2026-12-05", "2026-12-05")`, delete the two rows. Expected: `{ "2026-12-04": 150, "2026-12-05": 160 }` and `{ <car>: { "2026-12-05": 160 } }`; rows count back to 0.
- [ ] **Step 4: Run `npx tsc --noEmit`** — Expected: no errors outside `.next/`.
- [ ] **Step 5: Commit** — `git add prisma/schema.prisma src/lib/rates.ts && git commit -m "feat(rates): CarRate table and rate map queries"`

---

### Task 3: Admin Rates page

**Files:**
- Create: `src/lib/rate-actions.ts` (`"use server"`), `src/app/admin/(dashboard)/rates/page.tsx`, `src/components/admin/RateCalendar.tsx`
- Modify: `src/app/admin/(dashboard)/layout.tsx` (NAV: `{ href: "/admin/rates", label: "Rates" }` right after Fleet)

**Interfaces:**
- Consumes: `planRateChange`, `RateMap` (Task 1); `getRateMap` (Task 2); `isAuthenticated` (`src/lib/auth.ts`); `ActionResult` (`src/lib/actions.ts`); `todayNY`, `addDays` (`booking-options.ts`)
- Produces:
  - `applyRatesAction(input: { carId: string; from: string; to: string; weekdays: number[]; price: number }): Promise<ActionResult>`
  - `clearRatesAction(input: { carId: string; from: string; to: string; weekdays: number[] }): Promise<ActionResult>`
  - `RateCalendar` props: `{ cars: { id: string; name: string }[]; car: { id: string; name: string; dailyRate: number }; month: string /* YYYY-MM */; rates: RateMap; today: string }`

- [ ] **Step 1: Implement the actions.** Not authenticated → `{ ok: false, error: "Please sign in again." }`. Car missing → `{ ok: false, error: "That vehicle no longer exists." }`. `planRateChange` error → `{ ok: false, error }`. Apply = one `prisma.$transaction([deleteMany({ carId, date: { in } }), createMany(...)])`; success message `Saved $<price>/day for <n> day(s).` Clear = `deleteMany`; message `Reset <n> day(s) to the base rate.` Both `revalidatePath("/admin/rates")` and `revalidatePath("/")`.
- [ ] **Step 2: Implement the page.** `searchParams: Promise<{ car?: string; month?: string }>`; cars ordered like `fleet/page.tsx` (`sortOrder`, `createdAt`), name `make model year`; default car = first, default month = `todayNY().slice(0, 7)`; invalid `month` → default; loads `getRateMap` for the month's first to last day. No cars → "Add a car in Fleet first."
- [ ] **Step 3: Implement `RateCalendar`** per spec section "Admin — /admin/rates": car `<select>` and ‹ › month buttons navigate with `router.push("/admin/rates?car=…&month=…")`; Mon-first 7-column grid; cell shows `money(rates[d] ?? car.dailyRate)`, custom = accent style, base = muted, `d < today` disabled; first click sets From, second click sets To (swap if earlier), a third click starts over; From/To date inputs editable; weekday toggles Mon…Sun all on; price input; Apply / Reset to base call the actions inside `useTransition`, show the returned message or error, then `router.refresh()`. Base rate line links to `/admin/fleet/<car id>`.
- [ ] **Step 4: Run `npm test` and `npm run build`** — Expected: tests PASS; build lists `ƒ /admin/rates`.
- [ ] **Step 5: Commit** — `git add src/lib/rate-actions.ts "src/app/admin/(dashboard)/rates" src/components/admin/RateCalendar.tsx "src/app/admin/(dashboard)/layout.tsx" && git commit -m "feat(admin): Rates calendar with bulk apply and reset"`

---

### Task 4: Public site prices

**Files:**
- Modify: `src/lib/types.ts` (`CarDTO.rates: Record<string, number>`), `src/app/page.tsx`, `src/components/public/CarCard.tsx`, `src/components/public/CarGallery.tsx`, `src/components/public/BookingModal.tsx`

**Interfaces:**
- Consumes: `getRateMaps` (Task 2); `nightlyRates`, `quoteFromNights`, `groupNights`, `displayRate` (Task 1); `useFleetFilter().draft` (`pickupDate`, `returnDate`)

- [ ] **Step 1: `page.tsx`** — `getRateMaps(cars.map((c) => c.id), todayNY(), addDays(todayNY(), 365))`, set `rates: maps[c.id] ?? {}` on each DTO.
- [ ] **Step 2: Card and gallery price** — `displayRate(car.dailyRate, car.rates, draft.pickupDate, draft.returnDate)`; show `money(price)` + ` /day`; when `isAverage`, add a small line `avg for your dates` under the price pill (card) / next to the price (gallery).
- [ ] **Step 3: Modal summary** — `nights = nightlyRates(car.dailyRate, car.rates, startDate, endDate)`, `quote = nights.length ? quoteFromNights(nights) : null`; replace the single "rate × days" row with one row per `groupNights(nights)`: `$<price> × <count> day(s)` and `money(price * count)`; tax lines, total and deposit note unchanged.
- [ ] **Step 4: Run `npm test` and `npx tsc --noEmit`** — Expected: PASS, no type errors.
- [ ] **Step 5: Commit** — `git add src/lib/types.ts src/app/page.tsx src/components/public && git commit -m "feat(site): show per-day prices on cards and in the booking modal"`

---

### Task 5: Booking API and emails

**Files:**
- Modify: `src/app/api/bookings/route.ts`, `src/lib/email.ts`

**Interfaces:**
- Consumes: `getRateMap` (Task 2); `nightlyRates`, `quoteFromNights`, `groupNights`, `PriceGroup`, `Night` (Task 1); `Quote` (`format.ts`)
- Produces: `BookingEmailData` drops `dailyRate` and gains `quote: Quote` and `groups: PriceGroup[]`.

- [ ] **Step 1: API** — after the car checks: `rates = await getRateMap(car.id, data.startDate, data.endDate)`, `nights = nightlyRates(car.dailyRate, rates, data.startDate, data.endDate)`, `quote = quoteFromNights(nights)`; store `days: quote.days`, `dailyRate: quote.dailyRate`, `subtotal: quote.subtotal`, `rateBreakdown: nights`, `totalPrice: quote.total`; pass `quote` and `groups: groupNights(nights)` to `sendBookingNotifications`.
- [ ] **Step 2: Emails** — both templates use `data.quote` (no `computeQuote` call). Client "FARE": one row per group `${car} · $<price> × <count> day(s)` with `usd(price * count)`. Owner "Subtotal" row: groups joined with ` + ` as `$<price> × <count>`, then ` = ${usd(quote.subtotal)}`.
- [ ] **Step 3: Verify the emails render** — export the two template functions into a temporary copy and render to `public/__email-preview/` exactly as in the earlier mobile fix (render script + temp file, both deleted afterwards), with groups `[{100,2},{150,1}]`; open at 360px and desktop. Expected: two FARE rows, subtotal $350.00, total $443.71, document width = viewport at 360px. Delete `public/__email-preview/`.
- [ ] **Step 4: Run `npx tsc --noEmit`** — Expected: no errors.
- [ ] **Step 5: Commit** — `git add src/app/api/bookings/route.ts src/lib/email.ts && git commit -m "feat(booking): charge per-day prices and show the breakdown in emails"`

---

### Task 6: Admin booking views and manual bookings

**Files:**
- Modify: `src/app/admin/(dashboard)/bookings/page.tsx`, `src/components/admin/BookingRow.tsx`, `src/lib/actions.ts` (`createBookingAction`), `src/app/admin/(dashboard)/bookings/new/page.tsx`, `src/components/admin/NewBookingForm.tsx`

**Interfaces:**
- Consumes: `quoteFromSubtotal` (Task 1, `format.ts`); `getRateMap`, `getRateMaps` (Task 2); `nightlyRates`, `quoteFromNights`, `groupNights`, `Night`, `RateMap` (Task 1)
- Produces: `BookingItem` gains `subtotal: number | null; rateBreakdown: Night[] | null`; `CarOption` gains `rates: RateMap`.

- [ ] **Step 1: Booking list** — map `subtotal` and `rateBreakdown` (cast from JSON) into `BookingItem`. In `BookingRow`, when `subtotal !== null`: quote = `quoteFromSubtotal(subtotal, days)`, one line per `groupNights(rateBreakdown ?? [])`, no legacy note; otherwise keep today's `computeQuote` + legacy pre-tax note.
- [ ] **Step 2: Manual booking** — `createBookingAction` prices with `getRateMap` + `nightlyRates` + `quoteFromNights` on the form's date strings and stores `subtotal`, `rateBreakdown`, average `dailyRate`, `totalPrice`. The new-booking page passes `rates` from `getRateMaps(ids, addDays(todayNY(), -90), addDays(todayNY(), 365))`; `NewBookingForm` estimates with `quoteFromNights(nightlyRates(rate, rates, start, end))`.
- [ ] **Step 3: Run `npm test` and `npm run build`** — Expected: PASS, build succeeds.
- [ ] **Step 4: Commit** — `git add "src/app/admin/(dashboard)/bookings" src/components/admin/BookingRow.tsx src/components/admin/NewBookingForm.tsx src/lib/actions.ts && git commit -m "feat(admin): booking views and manual bookings use per-day prices"`

---

### Task 7: End-to-end verification and cleanup

No code. Dev server via the Browser pane (`preview_start` "apex-website").

- [ ] **Step 1: Seed test data** — temporary car (`make: "TEST"`, `model: "Car (do not book)"`, ECONOMY, `dailyRate: 100`, `isAvailable: true`, `sortOrder: -1`) and `CarRate` 150 on the middle day of a 3-day range at least a week ahead.
- [ ] **Step 2: API** — POST a booking for that range. Expected: 201; DB row `subtotal 350`, `rateBreakdown` three nights `[100, 150, 100]`, `dailyRate 116.67`, `totalPrice 443.71`.
- [ ] **Step 3: UI** — set the same dates in the hero search → the test car card shows `$116.67 /day` + "avg for your dates"; open the modal → rows `$100 × 2 days` and `$150 × 1 day`, total `$443.71`; submit → "Request sent"; DB row matches Step 2.
- [ ] **Step 4: Admin (owner logs in to localhost admin in the pane)** — Rates page: select the test car, apply $200 to Fri–Sun of next month → those cells highlighted; Reset to base on the same range → cells back to base; a past-only range shows "All selected days are in the past."; the test booking's row shows the grouped breakdown.
- [ ] **Step 5: Cleanup** — delete the test car's bookings, rates and the car; confirm car count and booking count equal their values before Step 1; `npm test` and `npm run build` pass; `git status` shows no stray files.
