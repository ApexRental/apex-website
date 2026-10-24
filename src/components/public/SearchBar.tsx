"use client";

import { useState } from "react";
import { useFleetFilter } from "./FleetFilterContext";
import DatePicker from "./DatePicker";
import SelectField from "./SelectField";
import {
  AREA_GROUPS,
  TIME_GROUPS,
  DEFAULT_PICKUP_AREA,
  SAME_AS_PICKUP,
  DEFAULT_TIME,
  todayNY,
  addDays,
} from "@/lib/booking-options";

const pinIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M12 21s-6-5.1-6-10a6 6 0 1112 0c0 4.9-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

const RETURN_GROUPS = [
  { options: [{ value: SAME_AS_PICKUP, label: "Same as pick-up" }] },
  ...AREA_GROUPS,
];

/** A labelled field shell — keeps every control the same height/box. */
function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg bg-raised px-4 py-2.5">
      {children}
    </div>
  );
}

export default function SearchBar() {
  const { category, applyAndScroll } = useFleetFilter();
  const today = todayNY();

  const [pickupLocation, setPickupLocation] = useState(DEFAULT_PICKUP_AREA);
  const [returnLocation, setReturnLocation] = useState(SAME_AS_PICKUP);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState(DEFAULT_TIME);
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState(DEFAULT_TIME);
  const [error, setError] = useState<string | null>(null);

  function search() {
    setError(null);
    if (!pickupDate || !returnDate) {
      setError("Please choose pick-up and drop-off dates.");
      return;
    }
    if (returnDate <= pickupDate) {
      setError("Drop-off must be at least one day after pick-up.");
      return;
    }
    applyAndScroll(category, {
      pickupLocation,
      returnLocation,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });
  }

  return (
    <div className="relative z-30 mx-auto -mt-4 max-w-5xl px-4 sm:px-6 sm:-mt-8">
      <div className="rounded-2xl border border-line bg-surface/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          {/* ---- Pick-up ---- */}
          <div className="rounded-xl border border-line/60 p-3">
            <p className="mb-2.5 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-accent-bright">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-bright" />
              Pick-up
            </p>
            <div className="space-y-2">
              <Cell>
                <SelectField
                  label="Delivery location"
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  icon={pinIcon}
                  groups={AREA_GROUPS}
                />
              </Cell>
              <div className="grid grid-cols-2 gap-2">
                <Cell>
                  <DatePicker
                    label="Date"
                    value={pickupDate}
                    min={today}
                    placeholder="Select"
                    onChange={(v) => {
                      setPickupDate(v);
                      if (returnDate && v && returnDate <= v) setReturnDate("");
                    }}
                  />
                </Cell>
                <Cell>
                  <SelectField label="Time" value={pickupTime} onChange={setPickupTime} groups={TIME_GROUPS} />
                </Cell>
              </div>
            </div>
          </div>

          {/* ---- Drop-off ---- */}
          <div className="rounded-xl border border-line/60 p-3">
            <p className="mb-2.5 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted/60" />
              Drop-off
            </p>
            <div className="space-y-2">
              <Cell>
                <SelectField
                  label="Return location"
                  value={returnLocation}
                  onChange={setReturnLocation}
                  icon={pinIcon}
                  groups={RETURN_GROUPS}
                />
              </Cell>
              <div className="grid grid-cols-2 gap-2">
                <Cell>
                  <DatePicker
                    label="Date"
                    value={returnDate}
                    min={addDays(pickupDate || today, 1)}
                    placeholder="Select"
                    onChange={setReturnDate}
                  />
                </Cell>
                <Cell>
                  <SelectField label="Time" value={returnTime} onChange={setReturnTime} groups={TIME_GROUPS} />
                </Cell>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 px-1 text-xs text-danger">{error}</p>
        )}

        <button
          onClick={search}
          className="btn btn-primary mt-3 flex w-full items-center justify-center gap-2 py-4 text-sm"
        >
          Search available cars
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        <p className="mt-2.5 text-center text-[11px] text-muted/70">
          Free delivery across New York &amp; New Jersey · no counter, we come to you
        </p>
      </div>
    </div>
  );
}
