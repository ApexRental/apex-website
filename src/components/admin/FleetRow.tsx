"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteCarAction,
  toggleCarAvailabilityAction,
  toggleCarOverbookedAction,
} from "@/lib/actions";
import { money, CATEGORY_LABELS } from "@/lib/format";

export type FleetItem = {
  id: string;
  name: string;
  category: string;
  dailyRate: number;
  deposit: number;
  isAvailable: boolean;
  overbooked: boolean;
  bookingCount: number;
};

export default function FleetRow({ car }: { car: FleetItem }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line/60 px-5 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {car.name}
          {!car.isAvailable && (
            <span className="ml-2 rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">
              hidden
            </span>
          )}
          {car.overbooked && (
            <span className="ml-2 rounded border border-warning/50 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
              overbooked
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {CATEGORY_LABELS[car.category] ?? car.category} ·{" "}
          {money(car.dailyRate)}/day · deposit {money(car.deposit)} ·{" "}
          {car.bookingCount} booking{car.bookingCount === 1 ? "" : "s"}
        </p>
        {notice && <p className="mt-1 text-xs text-warning">{notice}</p>}
      </div>

      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleCarOverbookedAction(car.id))}
        className={`rounded border px-3 py-1.5 text-xs disabled:opacity-50 ${
          car.overbooked
            ? "border-warning/50 bg-warning/10 text-warning hover:border-warning"
            : "border-line text-muted hover:border-accent/50 hover:text-fg"
        }`}
      >
        {car.overbooked ? "Make bookable" : "Mark overbooked"}
      </button>

      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleCarAvailabilityAction(car.id))}
        className="rounded border border-line px-3 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-fg disabled:opacity-50"
      >
        {car.isAvailable ? "Hide from site" : "Show on site"}
      </button>

      <Link
        href={`/admin/fleet/${car.id}`}
        className="rounded border border-line px-3 py-1.5 text-xs hover:border-accent/50"
      >
        Edit
      </Link>

      {confirming ? (
        <span className="flex items-center gap-2">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteCarAction(car.id);
                if (res.message && res.message.includes("hidden")) {
                  setNotice(res.message);
                }
                setConfirming(false);
              })
            }
            className="rounded border border-danger/50 bg-danger/10 px-3 py-1.5 text-xs text-danger disabled:opacity-50"
          >
            {pending ? "…" : "Confirm delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-muted hover:text-fg"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded border border-line px-3 py-1.5 text-xs text-muted hover:border-danger/50 hover:text-danger"
        >
          Delete
        </button>
      )}
    </li>
  );
}
