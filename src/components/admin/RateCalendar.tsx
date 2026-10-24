"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { applyRatesAction, clearRatesAction } from "@/lib/rate-actions";
import { expandRange, type RateMap } from "@/lib/pricing";
import { money } from "@/lib/format";
import type { ActionResult } from "@/lib/actions";

type Props = {
  cars: { id: string; name: string }[];
  car: { id: string; name: string; dailyRate: number };
  month: string; // YYYY-MM
  rates: RateMap;
  today: string; // YYYY-MM-DD
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** Display order Mon…Sun with JS weekday numbers (0 = Sun). */
const WEEKDAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const inputCls =
  "w-full rounded border border-line bg-raised px-3 py-2.5 text-sm outline-none placeholder:text-muted/50 focus:border-accent";

const weekdayOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

/** Calendar cells for a month, Monday first; null = leading blank. */
function monthCells(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (weekdayOf(`${month}-01`) + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  return cells;
}

export default function RateCalendar({ cars, car, month, rates, today }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);

  const cells = useMemo(() => monthCells(month), [month]);
  const [y, m] = month.split("-").map(Number);
  // the page remounts this component per car (key), so a month switch only clears the message
  const go = (carId: string, toMonth: string) => {
    setResult(null);
    router.push(`/admin/rates?car=${carId}&month=${toMonth}`);
  };

  const selectedCount = from && to ? expandRange(from, to, weekdays).length : 0;
  const isSelected = (d: string) => !!from && !!to && d >= from && d <= to && weekdays.includes(weekdayOf(d));

  function pickDay(d: string) {
    setResult(null);
    if (!awaitingEnd) {
      setFrom(d);
      setTo(d);
      setAwaitingEnd(true);
      return;
    }
    if (d < from) {
      setTo(from);
      setFrom(d);
    } else {
      setTo(d);
    }
    setAwaitingEnd(false);
  }

  function toggleWeekday(value: number) {
    setWeekdays((w) => (w.includes(value) ? w.filter((x) => x !== value) : [...w, value]));
  }

  function run(action: () => Promise<ActionResult>) {
    setResult(null);
    startTransition(async () => {
      const res = await action();
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* ---- calendar ---- */}
      <section className="rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={car.id}
            onChange={(e) => go(e.target.value, month)}
            className="rounded border border-line bg-raised px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => go(car.id, shiftMonth(month, -1))}
              className="flex h-8 w-8 items-center justify-center rounded border border-line text-muted hover:border-accent/50 hover:text-fg"
            >
              ‹
            </button>
            <span className="min-w-36 text-center font-display text-sm font-bold">
              {MONTHS[m - 1]} {y}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => go(car.id, shiftMonth(month, 1))}
              className="flex h-8 w-8 items-center justify-center rounded border border-line text-muted hover:border-accent/50 hover:text-fg"
            >
              ›
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Base rate: <span className="text-fg">{money(car.dailyRate)}/day</span> ·{" "}
          <Link href={`/admin/fleet/${car.id}`} className="text-accent-bright hover:underline">
            Edit in Fleet
          </Link>
        </p>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-muted/70">
          {WEEKDAYS.map((w) => (
            <span key={w.value} className="py-1">
              {w.label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`blank-${i}`} />;
            const custom = d in rates;
            const past = d < today;
            const selected = isSelected(d);
            return (
              <button
                key={d}
                type="button"
                disabled={past}
                onClick={() => pickDay(d)}
                className={`flex h-14 flex-col items-center justify-center rounded border text-xs transition-colors ${
                  past
                    ? "cursor-not-allowed border-transparent text-muted/30"
                    : custom
                      ? "border-accent/40 bg-accent-dim text-accent-bright hover:border-accent"
                      : "border-line/60 text-muted hover:border-accent/50 hover:text-fg"
                } ${selected ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""}`}
              >
                <span className="text-[10px] opacity-70">{Number(d.slice(8))}</span>
                <span className="font-semibold">{money(rates[d] ?? car.dailyRate)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-accent/40 bg-accent-dim" /> Custom price
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-line/60" /> Base rate
          </span>
          <span>Click a day, then another, to select a range.</span>
        </div>
      </section>

      {/* ---- bulk panel ---- */}
      <section className="space-y-4 rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider">Set prices</h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">From</span>
            <input
              type="date"
              value={from}
              min={today}
              onChange={(e) => {
                setFrom(e.target.value);
                setAwaitingEnd(false);
                setResult(null);
              }}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">To</span>
            <input
              type="date"
              value={to}
              min={from || today}
              onChange={(e) => {
                setTo(e.target.value);
                setAwaitingEnd(false);
                setResult(null);
              }}
              className={inputCls}
            />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted">Days of the week</span>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((w) => {
              const on = weekdays.includes(w.value);
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => toggleWeekday(w.value)}
                  aria-pressed={on}
                  className={`rounded border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    on
                      ? "border-accent bg-accent-dim text-accent-bright"
                      : "border-line text-muted hover:border-accent/50"
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Price per day, $</span>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            max={10000}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={String(car.dailyRate)}
            className={inputCls}
          />
        </label>

        <p className="text-xs text-muted">
          {selectedCount > 0 ? `${selectedCount} day${selectedCount === 1 ? "" : "s"} selected` : "No days selected yet"}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !from || !to || price === ""}
            onClick={() =>
              run(() => applyRatesAction({ carId: car.id, from, to, weekdays, price: Number(price) }))
            }
            className="cta-cut bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-bright disabled:opacity-50"
          >
            {pending ? "Saving…" : "Apply"}
          </button>
          <button
            type="button"
            disabled={pending || !from || !to}
            onClick={() => run(() => clearRatesAction({ carId: car.id, from, to, weekdays }))}
            className="rounded border border-line px-4 py-2.5 text-sm text-muted hover:border-accent/50 hover:text-fg disabled:opacity-50"
          >
            Reset to base
          </button>
        </div>

        {result && (
          <p
            className={`rounded border px-4 py-2.5 text-sm ${
              result.ok
                ? "border-success/40 bg-success/10 text-success"
                : "border-danger/40 bg-danger/10 text-danger"
            }`}
          >
            {result.ok ? result.message : result.error}
          </p>
        )}
      </section>
    </div>
  );
}
