"use client";

import { useEffect, useRef, useState } from "react";
import type { DropdownGroup } from "@/lib/booking-options";

/**
 * Custom themed dropdown (not a native <select>, whose open list the browser
 * renders with system colors that clash with the dark theme). Trigger + popover
 * styled to match the DatePicker. Supports grouped options.
 */
export default function SelectField({
  label,
  value,
  onChange,
  groups,
  icon,
  placeholder = "Select",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  groups: DropdownGroup[];
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = groups
    .flatMap((g) => g.options)
    .find((o) => o.value === value);

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

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left"
      >
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className="min-w-0 flex-1">
          {label && (
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted">
              {label}
            </span>
          )}
          <span className={`mt-0.5 block truncate text-sm ${current ? "text-fg" : "text-muted/60"}`}>
            {current ? current.label : placeholder}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="scroll-dark card absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto p-1 shadow-2xl shadow-black/60">
          {groups.map((g, gi) => (
            <div key={gi}>
              {g.label && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted/70">
                  {g.label}
                </p>
              )}
              {g.options.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-accent-dim text-accent-bright"
                        : "text-fg hover:bg-raised"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {active && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
