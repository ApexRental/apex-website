# Rate management (per-day pricing) — design

Date: 2026-10-24 · Status: approved in chat, pending spec review

## Goal

Let the admin set a different daily price per car per calendar day (weekends,
holidays, seasons), and have the site, booking API, emails and admin views all
charge and show those prices consistently.

## Decisions (agreed with the owner)

1. **Input model:** a per-car month calendar plus a bulk tool (date range +
   optional weekday filter + price). Days without a custom price use the car's
   base `dailyRate`.
2. **Storage:** one row per car per date with a custom price (approach A).
   No rules engine.
3. **Customer-facing price:** with no dates chosen, cards show the base rate;
   once dates are chosen in the hero search, cards show the average for those
   dates ("avg for your dates") and the booking modal shows a per-price
   breakdown.
4. **Existing bookings keep their stored price**; nothing is recalculated.
5. Per-car editing only. Percentage markups across many cars, availability
   blocking, minimum stays and TSD sync are out of scope.

## Billable days

A rental from `startDate` to `endDate` bills every calendar day from
`startDate` (inclusive) to `endDate` (exclusive): 27 → 30 Oct bills 27, 28, 29.
This matches today's `days` calculation. Pickup/return times never change the
billable days.

## Data model (Prisma, additive migration via `prisma db push`)

```prisma
model CarRate {
  id        String   @id @default(cuid())
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  carId     String
  date      DateTime @db.Date   // calendar day, no time
  price     Float               // USD per day
  updatedAt DateTime @updatedAt

  @@unique([carId, date])
}

model Car     { /* … */ rates CarRate[] }

model Booking {
  /* … existing fields … */
  subtotal      Float?  // rental before tax; null on bookings made before this feature
  rateBreakdown Json?   // [{ date: "YYYY-MM-DD", price: number }, …]
}
```

`Booking.dailyRate` keeps existing meaning for old rows; for new rows it stores
the **average** nightly price (rounded to cents) so existing displays stay sane.

## Pricing core — `src/lib/pricing.ts` (pure, used by browser and server)

Dates are always `"YYYY-MM-DD"` strings; day arithmetic uses UTC calendar math
(reuses `addDays` from `booking-options.ts`). No `Date` objects with times.

```ts
type RateMap = Record<string, number>;          // date -> custom price
type Night   = { date: string; price: number };

billableDates(startDate, endDate): string[]       // [start, end)
nightlyRates(base, rates: RateMap, startDate, endDate): Night[]
groupNights(nights): { price: number; count: number }[]  // order of first appearance
quoteFromNights(nights): Quote                    // subtotal = Σ price; taxes as today
expandRange(from, to, weekdays: number[]): string[] // [from, to], 0 = Sun … 6 = Sat
```

`format.ts` gains `quoteFromSubtotal(subtotal, days)`; `computeQuote(dailyRate,
days)` becomes a thin wrapper over it, so the tax math lives in one place and
legacy callers are unchanged. `quoteFromNights` returns the same `Quote` shape
with `dailyRate` = average.

## Server data access — `src/lib/rates.ts` (server-only)

- `getRateMap(carId, from, to)` → `RateMap` for one car.
- `getRateMaps(carIds, from, to)` → `Record<carId, RateMap>` in one query.

## Admin — `/admin/rates`

- New nav item **Rates** after Fleet in `admin/(dashboard)/layout.tsx`.
- Server page reads `?car=<id>&month=YYYY-MM` (defaults: first car, current NY
  month), loads all cars (hidden ones too) and that car's rates for the month.
- Client component `RateCalendar`:
  - car selector; base rate shown with a link to edit it in Fleet;
  - month grid with ‹ › navigation; each cell shows the day's price — custom
    prices highlighted, base prices muted; past days disabled;
  - click a day, then another → range selected (one click = one day);
  - bulk panel: From / To (prefilled from the selection), weekday toggles
    Mon…Sun (all on), "Price per day, $", buttons **Apply** and
    **Reset to base**; inline success/error message; refresh after save.
- Server actions (auth required, Zod-validated) in `src/lib/rate-actions.ts`:
  - `applyRatesAction({ carId, from, to, weekdays, price })`: expands the range,
    drops dates before today (NY), replaces those dates' rows in one
    transaction (deleteMany + createMany).
  - `clearRatesAction({ carId, from, to, weekdays })`: deletes those rows.
  - Validation: `to ≥ from`, span ≤ 366 days, ≥ 1 weekday, price 1–10,000
    rounded to cents, car exists; all-past selection → clear error; dates
    more than 365 days ahead are rejected, so the site's 365-day rate window
    always matches what the server charges.
  - Revalidate `/admin/rates` and `/`.

## Public site

- `page.tsx` loads rate maps for visible cars from today (NY) to +365 days and
  adds `rates: RateMap` to `CarDTO`.
- `CarCard` and `CarGallery`: if the search draft has pickup and return dates,
  show the average of `nightlyRates` with a small "avg for your dates" label;
  otherwise the base rate.
- `BookingModal`: price summary from `quoteFromNights`; one line
  "$100 × 3 days" when all nights match, otherwise one line per price group;
  then taxes and total as today.

## Booking API (`/api/bookings`)

Loads the car's rate map for the requested dates, builds nights + quote, and
stores `subtotal`, `rateBreakdown`, `dailyRate` (average) and `totalPrice`.
The client never sends a price. Emails receive the quote and price groups.

## Emails, admin booking views, manual bookings

- Client and owner emails render the passed quote and price groups instead of
  recomputing `dailyRate × days`.
- `BookingRow`: if `subtotal` is set, use it and `rateBreakdown` for the
  breakdown; otherwise the legacy calculation.
- Admin **New booking** (`createBookingAction`) prices with the calendar on the
  server (authoritative). The form's live estimate uses rate maps passed from
  its page, covering 90 days back to 365 days ahead; outside that window the
  estimate falls back to the base rate and the saved booking is still correct.

## Error handling

- Invalid action input → returned error message shown in the panel; no partial
  writes (single transaction).
- Unique `(carId, date)` makes re-applying idempotent.
- Deleting a car deletes its rates (cascade).

## Testing

- Unit tests `src/lib/pricing.test.ts` on Node's built-in runner
  (`node --import tsx --test`), new `npm test` script, no new dependencies:
  no custom prices = base × days; mixed prices; return day not billed;
  `groupNights` order; `expandRange` weekday filter and inclusive bounds;
  totals add up to the cent; `computeQuote` unchanged for legacy callers.
- End-to-end (same as the booking test): temporary visible test car, custom
  prices written to the DB, booking through the API and the UI, check stored
  `subtotal` / `rateBreakdown` / total and the modal's grouped lines, then
  delete the car, its rates and bookings.
- Admin Rates page: verified in the browser pane after the owner logs in to
  localhost admin themselves (Claude does not enter passwords).

## Rollout

Ships with the pending booking redesign: `prisma db push` (new table + two
nullable columns, safe for the live site), deploy code, restart PM2.
