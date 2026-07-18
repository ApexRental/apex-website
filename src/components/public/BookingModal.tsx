"use client";

import { useMemo, useState } from "react";
import { CarDTO } from "@/lib/types";
import { money, daysBetween, computeQuote } from "@/lib/format";
import DatePicker from "./DatePicker";

type Props = {
  car: CarDTO;
  onClose: () => void;
  initialDates?: { pickup: string; return: string };
};

const inputCls =
  "w-full rounded-lg border border-line bg-raised/60 px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-accent/70 focus:bg-raised";

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">
        {label}
        {optional && <span className="ml-1 opacity-60">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

export default function BookingModal({ car, onClose, initialDates }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(initialDates?.pickup ?? "");
  const [endDate, setEndDate] = useState(initialDates?.return ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) return 0;
    return daysBetween(s, e);
  }, [startDate, endDate]);

  const quote = days > 0 ? computeQuote(car.dailyRate, days) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (days < 1) {
      setError("Please pick valid pickup and return dates.");
      return;
    }
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          email: form.get("email"),
          licenseNumber: form.get("licenseNumber") || undefined,
          startDate,
          endDate,
          message: form.get("message") || undefined,
          company: form.get("company") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="card max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-2xl p-6 sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent-dim text-2xl text-accent-bright">
              ✓
            </div>
            <h3 className="font-display text-2xl font-extrabold tracking-[-0.01em]">
              Request sent
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              We received your request for the{" "}
              <span className="text-fg">
                {car.make} {car.model}
              </span>
              . We&apos;ll call or email shortly to confirm availability and
              arrange pickup.
            </p>
            <button onClick={onClose} className="btn btn-primary mt-8 px-8 py-3 text-sm">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-bright">
                  Booking request
                </p>
                <h3 className="font-display mt-1.5 text-2xl font-extrabold tracking-[-0.01em]">
                  {car.make} {car.model}{" "}
                  <span className="font-medium text-muted">{car.year}</span>
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {money(car.dailyRate)}/day · deposit up to {money(car.deposit)}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-muted transition-colors hover:border-accent/50 hover:text-fg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* honeypot — hidden from real users; bots that fill it are dropped */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-line bg-raised/60 px-3.5 py-2.5">
                  <DatePicker
                    label="Pickup date"
                    value={startDate}
                    min={today}
                    placeholder="Select"
                    onChange={(v) => {
                      setStartDate(v);
                      if (endDate && v && endDate < v) setEndDate("");
                    }}
                  />
                </div>
                <div className="rounded-lg border border-line bg-raised/60 px-3.5 py-2.5">
                  <DatePicker
                    label="Return date"
                    value={endDate}
                    min={startDate || today}
                    placeholder="Select"
                    onChange={setEndDate}
                  />
                </div>
              </div>

              <Field label="Full name">
                <input name="fullName" required minLength={2} placeholder="John Doe" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input name="phone" type="tel" required placeholder="(646) 555-0123" className={inputCls} />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" required placeholder="you@email.com" className={inputCls} />
                </Field>
              </div>

              <Field label="Driver license #" optional>
                <input name="licenseNumber" className={inputCls} />
              </Field>

              <Field label="Message" optional>
                <textarea
                  name="message"
                  rows={2}
                  placeholder="Pickup location, questions…"
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* price summary */}
              <div className="rounded-xl border border-line bg-raised/50 p-4">
                {quote ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">
                        {money(car.dailyRate)} × {days} day{days > 1 ? "s" : ""}
                      </span>
                      <span className="font-medium">{money(quote.subtotal)}</span>
                    </div>
                    <div className="mt-2 space-y-1.5 border-t border-line/60 pt-2">
                      {quote.lines.map((l) => (
                        <div
                          key={l.label}
                          className="flex items-center justify-between text-xs text-muted"
                        >
                          <span>
                            {l.label}{" "}
                            <span className="text-muted/60">({l.note})</span>
                          </span>
                          <span>{money(l.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2.5">
                      <span className="text-sm font-semibold">Total</span>
                      <span className="font-display text-2xl font-extrabold">
                        {money(quote.total)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted/70">
                      Includes all taxes &amp; fees. Refundable deposit up to{" "}
                      {money(car.deposit)} is held separately at pickup.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">
                      Select dates for a price
                    </span>
                    <span className="font-display text-2xl font-extrabold">—</span>
                  </div>
                )}
              </div>

              {error && (
                <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3.5 text-sm">
                {submitting ? "Sending…" : "Send booking request"}
              </button>
              <p className="text-center text-xs leading-relaxed text-muted/70">
                No payment now. We confirm availability by phone or email before
                anything is charged.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
