"use client";

import { useState } from "react";
import { CATEGORY_LABELS } from "@/lib/format";
import { useFleetFilter } from "./FleetFilterContext";
import DatePicker from "./DatePicker";

const TABS = ["ALL", "SEDAN", "SUV", "PREMIUM"];

export default function SearchBar() {
  const { applyAndScroll } = useFleetFilter();
  const today = new Date().toISOString().slice(0, 10);
  const [tab, setTab] = useState("ALL");
  const [pickup, setPickup] = useState("");
  const [ret, setRet] = useState("");

  return (
    <div className="relative z-30 mx-auto -mt-14 max-w-5xl px-4 sm:px-6">
      <div className="rounded-xl border border-line bg-surface/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-md">
        {/* category tabs */}
        <div className="flex flex-wrap gap-1 px-1 pb-2 pt-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === t
                  ? "border-accent/60 bg-accent/15 text-accent-bright"
                  : "border-transparent text-muted hover:bg-raised hover:text-fg"
              }`}
            >
              {t === "ALL" ? "All cars" : CATEGORY_LABELS[t] ?? t}
            </button>
          ))}
        </div>

        {/* fields */}
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-stretch">
          <div className="rounded-lg bg-raised px-4 py-2.5">
            <DatePicker
              label="Pickup date"
              value={pickup}
              min={today}
              onChange={(v) => {
                setPickup(v);
                if (ret && v && ret < v) setRet("");
              }}
            />
          </div>

          <div className="rounded-lg bg-raised px-4 py-2.5">
            <DatePicker
              label="Return date"
              value={ret}
              min={pickup || today}
              onChange={setRet}
            />
          </div>

          <button
            onClick={() => applyAndScroll(tab, { pickup, return: ret })}
            className="btn btn-primary px-8 py-4 text-sm"
          >
            Find your car
          </button>
        </div>
      </div>
    </div>
  );
}
