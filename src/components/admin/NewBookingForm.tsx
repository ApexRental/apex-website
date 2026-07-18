"use client";

import { useActionState, useMemo, useState } from "react";
import { createBookingAction, type ActionResult } from "@/lib/actions";
import { BOOKING_STATUSES, daysBetween, money, computeQuote } from "@/lib/format";

type CarOption = { id: string; label: string; dailyRate: number };

export default function NewBookingForm({ cars }: { cars: CarOption[] }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    createBookingAction,
    null
  );

  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const rate = cars.find((c) => c.id === carId)?.dailyRate ?? 0;

  const estimate = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(`${start}T00:00:00`);
    const e = new Date(`${end}T00:00:00`);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) return null;
    return computeQuote(rate, daysBetween(s, e));
  }, [start, end, rate]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vehicle *">
          <select
            name="carId"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            className={inputCls}
          >
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} — {money(c.dailyRate)}/day
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="CONFIRMED" className={inputCls}>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer name *">
          <input name="fullName" required placeholder="Jane Doe" className={inputCls} />
        </Field>
        <Field label="Phone *">
          <input name="phone" required placeholder="+1 646 …" className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email">
          <input name="email" type="email" placeholder="optional" className={inputCls} />
        </Field>
        <Field label="Driver license #">
          <input name="licenseNumber" placeholder="optional" className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pickup date *">
          <input
            name="startDate"
            type="date"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Return date *">
          <input
            name="endDate"
            type="date"
            required
            value={end}
            min={start || undefined}
            onChange={(e) => setEnd(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Note (optional)">
        <textarea
          name="message"
          rows={3}
          placeholder="Delivery address, flight number, special requests…"
          className={inputCls}
        />
      </Field>

      <div className="rounded border border-line bg-raised px-4 py-3 text-sm">
        {estimate ? (
          <>
            <div className="flex items-center justify-between text-muted">
              <span>
                {money(rate)} × {estimate.days} day{estimate.days > 1 ? "s" : ""}
              </span>
              <span>{money(estimate.subtotal)}</span>
            </div>
            {estimate.lines.map((l) => (
              <div
                key={l.label}
                className="mt-1 flex items-center justify-between text-xs text-muted/80"
              >
                <span>
                  {l.label} <span className="text-muted/50">({l.note})</span>
                </span>
                <span>{money(l.amount)}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-2">
              <span className="font-medium text-fg">Total</span>
              <span className="font-display font-bold">{money(estimate.total)}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-muted">Total</span>
            <span className="font-display font-bold">— pick dates —</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted/70">
        Total includes NYC &amp; NY taxes and the service charge. No email is sent
        for manually added bookings.
      </p>

      {state?.error && (
        <p className="rounded border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="cta-cut bg-accent px-8 py-3 font-display text-sm font-bold tracking-wider text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {pending ? "SAVING…" : "CREATE BOOKING"}
        </button>
        <a
          href="/admin/bookings"
          className="rounded border border-line px-6 py-3 text-sm text-muted hover:border-accent/50 hover:text-fg"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded border border-line bg-raised px-3 py-2.5 text-sm outline-none placeholder:text-muted/50 focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
