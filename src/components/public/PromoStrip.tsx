"use client";

import { useState } from "react";

export default function PromoStrip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-20 mx-auto mb-6 mt-6 flex max-w-5xl justify-center px-4 sm:px-6">
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {/* pill (always visible) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`card flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
            open ? "border-accent/50" : ""
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-dim text-accent-bright">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round" />
              <circle cx="6.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
          </span>
          <span className="text-sm">
            <span className="font-display font-bold">Save 10% with Apex</span>
            <span className="ml-2 hidden text-muted sm:inline">— 2 offers</span>
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* popover — floats over the content below, never shifts layout */}
        {open && (
          <div className="absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2">
            <div className="promo-pop flex w-80 max-w-[88vw] flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-2xl shadow-black/50">
            <span className="inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-accent-dim/50 px-3 py-2 text-xs font-medium text-fg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-bright)" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <span className="font-semibold">10% off</span> — first-time &amp; returning renters
              </span>
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-fg"
              style={{ borderColor: "rgba(217,182,118,0.4)", background: "rgba(217,182,118,0.08)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2">
                <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7C12 7 12 2 8.5 2S5 5.5 7 7M12 7c0 0 0-5 3.5-5S19 5.5 17 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <span className="font-semibold">10% off</span> — birthdays &amp; weddings
              </span>
            </span>
            <p className="pl-0.5 text-[11px] text-muted/70">
              Mention it when you book — we&apos;ll apply it.
            </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
