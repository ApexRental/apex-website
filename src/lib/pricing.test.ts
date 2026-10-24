import { test } from "node:test";
import assert from "node:assert/strict";
import {
  billableDates,
  nightlyRates,
  groupNights,
  quoteFromNights,
  displayRate,
  perDayRate,
  isCalendarDate,
  expandRange,
  planRateChange,
  rentalRangeError,
} from "./pricing";
import { computeQuote, quoteFromSubtotal, quoteFromLines, rentalDate } from "./format";

test("billable days exclude the return day", () =>
  assert.deepEqual(billableDates("2026-10-27", "2026-10-30"), ["2026-10-27", "2026-10-28", "2026-10-29"]));

test("month end + DST change bills 3 days", () =>
  assert.deepEqual(billableDates("2026-10-31", "2026-11-03"), ["2026-10-31", "2026-11-01", "2026-11-02"]));

test("same or reversed dates bill nothing", () => {
  assert.deepEqual(billableDates("2026-10-27", "2026-10-27"), []);
  assert.deepEqual(billableDates("2026-10-30", "2026-10-27"), []);
});

test("custom price applies only to its day", () =>
  assert.deepEqual(
    nightlyRates(100, { "2026-10-28": 150 }, "2026-10-27", "2026-10-30").map((n) => n.price),
    [100, 150, 100]
  ));

test("price on the return date is ignored", () =>
  assert.equal(quoteFromNights(nightlyRates(100, { "2026-10-30": 999 }, "2026-10-27", "2026-10-30")).total, 380.33));

test("no custom prices equals computeQuote", () =>
  assert.deepEqual(quoteFromNights(nightlyRates(100, {}, "2026-10-27", "2026-10-30")), computeQuote(100, 3)));

test("mixed quote", () => {
  const q = quoteFromNights(nightlyRates(100, { "2026-10-28": 150 }, "2026-10-27", "2026-10-30"));
  assert.equal(q.subtotal, 350);
  assert.deepEqual(q.lines.map((l) => l.amount), [31.06, 42, 20.65]);
  assert.equal(q.taxTotal, 93.71);
  assert.equal(q.total, 443.71);
  assert.equal(q.dailyRate, 116.67);
  assert.equal(q.days, 3);
});

test("groups keep first-appearance order", () =>
  assert.deepEqual(
    groupNights([{ date: "a", price: 100 }, { date: "b", price: 150 }, { date: "c", price: 100 }]),
    [{ price: 100, count: 2 }, { price: 150, count: 1 }]
  ));

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
  const T = "2026-10-24";
  const all = [0, 1, 2, 3, 4, 5, 6];
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

test("custom taxes", () => {
  const q = quoteFromSubtotal(350, 3, [{ label: "City tax", rate: 10 }]);
  assert.deepEqual(q.lines, [{ label: "City tax", note: "10%", amount: 35 }]);
  assert.equal(q.taxTotal, 35);
  assert.equal(q.total, 385);
});

test("no taxes", () => {
  const q = quoteFromSubtotal(350, 3, []);
  assert.deepEqual(q.lines, []);
  assert.equal(q.total, 350);
});

test("quoteFromNights uses the given taxes", () =>
  assert.equal(quoteFromNights(nightlyRates(100, {}, "2026-10-27", "2026-10-30"), [{ label: "City tax", rate: 10 }]).total, 330));

test("quoteFromLines keeps stored lines", () => {
  const q = quoteFromLines(350, 3, [{ label: "Old tax", note: "8%", amount: 28 }]);
  assert.equal(q.taxTotal, 28);
  assert.equal(q.total, 378);
  assert.equal(q.dailyRate, 116.67);
});

test("rentalRangeError caps online rentals at 365 days", () => {
  assert.equal(rentalRangeError("2026-11-01", "2027-11-01"), null); // exactly 365 days
  assert.equal(rentalRangeError("2026-11-01", "2027-11-02"), "Online bookings are limited to 365 days. Please call us for longer rentals.");
  assert.equal(rentalRangeError("2026-11-01", "9999-12-31"), "Online bookings are limited to 365 days. Please call us for longer rentals.");
});

test("rentalRangeError limits how far ahead a pickup can be", () => {
  assert.equal(rentalRangeError("2027-10-24", "2027-10-26", "2026-10-24"), null); // today + 365
  assert.equal(rentalRangeError("2027-10-25", "2027-10-26", "2026-10-24"), "Pickup can be booked up to one year ahead.");
});

test("default taxes keep the exact pre-Settings rounding (legacy bookings)", () => {
  const OLD_RATES = [0.08875, 0.12, 0.059]; // the constants used before taxes became editable
  for (let rate = 50; rate <= 1000; rate += 5) {
    for (let days = 1; days <= 30; days++) {
      const subtotal = Math.round(rate * days * 100) / 100;
      const oldLines = OLD_RATES.map((r) => Math.round(subtotal * r * 100) / 100);
      assert.deepEqual(computeQuote(rate, days).lines.map((l) => l.amount), oldLines, `${rate} x ${days}`);
    }
  }
});

test("pinned legacy examples", () => {
  assert.deepEqual(computeQuote(60, 1).lines.map((l) => l.amount), [5.32, 7.2, 3.54]);
  assert.equal(computeQuote(55, 1).lines[2].amount, 3.24);
});

test("planRateChange rounds the price before checking the limits", () => {
  assert.deepEqual(
    planRateChange({ from: "2026-11-02", to: "2026-11-02", weekdays: [1], price: 10000.004 }, "2026-10-24"),
    { dates: ["2026-11-02"], price: 10000 }
  );
  assert.deepEqual(
    planRateChange({ from: "2026-11-02", to: "2026-11-02", weekdays: [1], price: 10000.01 }, "2026-10-24"),
    { error: "Price must be between $1 and $10,000." }
  );
});

test("impossible calendar dates are not dates", () => {
  assert.equal(isCalendarDate("2026-02-28"), true);
  assert.equal(isCalendarDate("2028-02-29"), true);
  assert.equal(isCalendarDate("2026-02-29"), false);
  assert.equal(isCalendarDate("2026-02-30"), false);
  assert.equal(isCalendarDate("2026-13-01"), false);
  assert.equal(isCalendarDate("2026-1-01"), false);
  assert.deepEqual(billableDates("2026-02-30", "2026-03-02"), []);
});

test("perDayRate: a single price is shown as-is, mixed prices as an average", () => {
  assert.deepEqual(perDayRate(100, []), { price: 100, isAverage: false });
  assert.deepEqual(perDayRate(100, [{ date: "2026-11-01", price: 180 }, { date: "2026-11-02", price: 180 }]), { price: 180, isAverage: false });
  assert.deepEqual(perDayRate(100, [{ date: "2026-11-01", price: 100 }, { date: "2026-11-02", price: 150 }, { date: "2026-11-03", price: 100 }]), { price: 116.67, isAverage: true });
  assert.deepEqual(displayRate(100, {}, "2026-10-27", "2026-10-30"), { price: 100, isAverage: false });
});

test("rentalDate shows the stored calendar day in any server/browser timezone", () => {
  const tz = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    assert.equal(rentalDate("2026-11-29T00:00:00.000Z"), "Nov 29, 2026");
    assert.equal(rentalDate(new Date("2026-12-03T10:00:00.000Z")), "Dec 3, 2026");
  } finally {
    process.env.TZ = tz;
  }
});
