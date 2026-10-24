import { test } from "node:test";
import assert from "node:assert/strict";
import { monthToShow } from "./date-view";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

test("a selected date wins", () => {
  const shown = monthToShow(d(2026, 10, 1), d(2026, 12, 5), d(2026, 11, 11));
  assert.deepEqual([shown.getFullYear(), shown.getMonth()], [2026, 11]);
});

test("with no selection, jumps forward to the month of a later min date", () => {
  const shown = monthToShow(d(2026, 10, 1), null, d(2026, 11, 11));
  assert.deepEqual([shown.getFullYear(), shown.getMonth()], [2026, 10]);
});

test("jumps across a year boundary", () => {
  const shown = monthToShow(d(2026, 12, 1), null, d(2027, 1, 3));
  assert.deepEqual([shown.getFullYear(), shown.getMonth()], [2027, 0]);
});

test("keeps the current view when min is in the same or an earlier month", () => {
  const view = d(2026, 11, 1);
  assert.equal(monthToShow(view, null, d(2026, 11, 20)), view);
  assert.equal(monthToShow(view, null, d(2026, 10, 2)), view);
  assert.equal(monthToShow(view, null, null), view);
});
