"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse a YYYY-MM-DD string as a LOCAL date (avoids UTC off-by-one). */
function parseLocal(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function fmtValue(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function fmtDisplay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function DatePicker({
  value,
  onChange,
  min,
  label,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseLocal(value), [value]);
  const minDate = useMemo(() => (min ? parseLocal(min) : null), [min]);
  const [view, setView] = useState<Date>(
    () => selected ?? minDate ?? new Date()
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) setView(selected);
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = startOfDay(new Date());
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function isDisabled(d: Date): boolean {
    return minDate ? startOfDay(d) < startOfDay(minDate) : false;
  }

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span>
          {label && (
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted">
              {label}
            </span>
          )}
          <span className={`mt-0.5 block text-sm ${selected ? "text-fg" : "text-muted/60"}`}>
            {selected ? fmtDisplay(selected) : placeholder}
          </span>
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M4 9.5h16M8 3v4M16 3v4" />
        </svg>
      </button>

      {open && (
        <div className="card absolute left-0 top-full z-50 mt-2 w-[19rem] p-3 shadow-2xl shadow-black/60">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="font-display text-sm font-bold">
              {MONTHS[month]} {year}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted hover:border-accent/50 hover:text-fg"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted hover:border-accent/50 hover:text-fg"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted/70">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const disabled = isDisabled(d);
              const isSel = selected && sameDay(d, selected);
              const isToday = sameDay(d, today);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(fmtValue(d));
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center justify-center rounded-md text-sm transition-colors ${
                    isSel
                      ? "bg-accent font-semibold text-white"
                      : disabled
                        ? "cursor-not-allowed text-muted/25"
                        : "text-fg hover:bg-raised"
                  } ${isToday && !isSel ? "ring-1 ring-inset ring-accent/50" : ""}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-line/60 px-1 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs text-muted hover:text-fg"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                if (!isDisabled(t)) {
                  onChange(fmtValue(t));
                  setOpen(false);
                } else {
                  setView(t);
                }
              }}
              className="text-xs text-accent-bright hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
