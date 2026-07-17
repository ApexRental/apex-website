"use client";

import { useState, useTransition } from "react";
import {
  updateBookingStatusAction,
  saveBookingNotesAction,
} from "@/lib/actions";
import { BOOKING_STATUSES, money, dateShort } from "@/lib/format";
import StatusBadge from "./StatusBadge";

export type BookingItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string | null;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  totalPrice: number;
  status: string;
  message: string | null;
  adminNotes: string | null;
  createdAt: string;
  carName: string;
  conflict?: boolean;
};

export default function BookingRow({ booking }: { booking: BookingItem }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(booking.adminNotes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <li className="border-b border-line/60 last:border-b-0">
      <div
        className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-raised/40"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {booking.fullName}
            <span className="ml-2 text-muted">{booking.carName}</span>
            {booking.conflict && (
              <span
                title="Overlaps another active booking of this car"
                className="ml-2 rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning"
              >
                ⚠ Date conflict
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {dateShort(booking.startDate)} → {dateShort(booking.endDate)} ·{" "}
            {booking.days}d · {money(booking.totalPrice)} · requested{" "}
            {dateShort(booking.createdAt)}
          </p>
        </div>

        <StatusBadge status={booking.status} />

        <select
          value={booking.status}
          disabled={pending}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const status = e.target.value;
            startTransition(() => updateBookingStatusAction(booking.id, status));
          }}
          className="rounded border border-line bg-raised px-2 py-1.5 text-xs outline-none focus:border-accent disabled:opacity-50"
        >
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <span className={`text-xs text-muted transition-transform ${expanded ? "rotate-90" : ""}`}>
          ▸
        </span>
      </div>

      {expanded && (
        <div className="grid gap-6 border-t border-line/40 bg-raised/30 px-5 py-5 sm:grid-cols-2">
          <dl className="space-y-2 text-sm">
            <Row k="Phone" v={<a className="text-accent-bright hover:underline" href={`tel:${booking.phone}`}>{booking.phone}</a>} />
            <Row k="Email" v={<a className="text-accent-bright hover:underline" href={`mailto:${booking.email}`}>{booking.email}</a>} />
            <Row k="License #" v={booking.licenseNumber || "—"} />
            <Row k="Rate" v={`${money(booking.dailyRate)}/day × ${booking.days} days`} />
            {booking.message && <Row k="Message" v={booking.message} />}
          </dl>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Admin notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesSaved(false);
              }}
              rows={3}
              className="w-full resize-none rounded border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Deposit received, pickup at 10am…"
            />
            <button
              disabled={pending || notesSaved}
              onClick={() =>
                startTransition(async () => {
                  await saveBookingNotesAction(booking.id, notes);
                  setNotesSaved(true);
                })
              }
              className="mt-2 rounded border border-line px-3 py-1.5 text-xs hover:border-accent/50 disabled:opacity-50"
            >
              {notesSaved ? "Saved ✓" : pending ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-muted">{k}</dt>
      <dd className="min-w-0 break-words">{v}</dd>
    </div>
  );
}
