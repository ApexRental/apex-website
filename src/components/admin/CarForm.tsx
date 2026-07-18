"use client";

import { useActionState } from "react";
import { saveCarAction, type ActionResult } from "@/lib/actions";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/format";

export type CarFormData = {
  id?: string;
  make: string;
  model: string;
  year: number;
  category: string;
  seats: number;
  transmission: string;
  fuel: string;
  dailyRate: number;
  deposit: number;
  features: string;
  imageUrl: string | null;
  images: string;
  isAvailable: boolean;
  overbooked: boolean;
};

const EMPTY: CarFormData = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  category: "SEDAN",
  seats: 5,
  transmission: "Automatic",
  fuel: "Gasoline",
  dailyRate: 60,
  deposit: 500,
  features: "",
  imageUrl: null,
  images: "",
  isAvailable: true,
  overbooked: false,
};

export default function CarForm({ car }: { car?: CarFormData }) {
  const data = car ?? EMPTY;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveCarAction,
    null
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {data.id && <input type="hidden" name="id" value={data.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Make *">
          <input name="make" required defaultValue={data.make} placeholder="Toyota" className={inputCls} />
        </Field>
        <Field label="Model *">
          <input name="model" required defaultValue={data.model} placeholder="Camry" className={inputCls} />
        </Field>
        <Field label="Year *">
          <input name="year" type="number" required min={1990} max={2100} defaultValue={data.year} className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Category">
          <select name="category" defaultValue={data.category} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Seats">
          <input name="seats" type="number" min={2} max={15} defaultValue={data.seats} className={inputCls} />
        </Field>
        <Field label="Transmission">
          <select name="transmission" defaultValue={data.transmission} className={inputCls}>
            <option>Automatic</option>
            <option>Manual</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Fuel">
          <select name="fuel" defaultValue={data.fuel} className={inputCls}>
            <option>Gasoline</option>
            <option>Hybrid</option>
            <option>Electric</option>
            <option>Diesel</option>
          </select>
        </Field>
        <Field label="Daily rate, $ *">
          <input name="dailyRate" type="number" step="0.01" min={1} required defaultValue={data.dailyRate} className={inputCls} />
        </Field>
        <Field label="Deposit, $">
          <input name="deposit" type="number" step="1" min={0} defaultValue={data.deposit} className={inputCls} />
        </Field>
      </div>

      <Field label="Features (comma-separated)">
        <input
          name="features"
          defaultValue={data.features}
          placeholder="Bluetooth, Backup Camera, CarPlay"
          className={inputCls}
        />
      </Field>

      <Field label="Cover photo URL">
        <input
          name="imageUrl"
          defaultValue={data.imageUrl ?? ""}
          placeholder="/images/fleet/x5-1.jpg  or  https://res.cloudinary.com/…"
          className={inputCls}
        />
        <span className="mt-1 block text-[11px] text-muted/70">
          Paste a direct image link (a hosted URL or a file in /public/images). This is the card &amp; hero cover.
        </span>
      </Field>

      <Field label="Gallery photos (one URL per line — shown when a visitor opens the car)">
        <textarea
          name="images"
          rows={4}
          defaultValue={data.images.split(",").map((s) => s.trim()).filter(Boolean).join("\n")}
          placeholder={"/images/fleet/sonata-1.jpg\n/images/fleet/sonata-2.jpg"}
          className={`${inputCls} font-mono text-xs`}
        />
      </Field>

      {data.imageUrl && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Current photo</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt="Current car"
            className="h-32 rounded border border-line object-cover"
          />
        </div>
      )}

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={data.isAvailable}
          className="h-4 w-4 accent-[#2f6bff]"
        />
        Visible on the website
      </label>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="overbooked"
          defaultChecked={data.overbooked}
          className="h-4 w-4 accent-[#2f6bff]"
        />
        Overbooked — shown on the site but not bookable
      </label>

      {state?.error && (
        <p className="rounded border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cta-cut bg-accent px-8 py-3 font-display text-sm font-bold tracking-wider text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {pending ? "SAVING…" : data.id ? "SAVE CHANGES" : "ADD CAR"}
        </button>
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
