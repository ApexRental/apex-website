"use client";

import { useState, useTransition } from "react";
import { saveTaxesAction } from "@/lib/actions";
import type { TaxRate } from "@/lib/taxes";

type Row = { label: string; rate: string };

const inputCls =
  "w-full rounded border border-line bg-raised px-3 py-2.5 text-sm outline-none placeholder:text-muted/50 focus:border-accent";

/** Edit the taxes & fees list: name + % of the rental, add / remove rows. */
export default function TaxEditor({ initial }: { initial: TaxRate[] }) {
  const [rows, setRows] = useState<Row[]>(initial.map((t) => ({ label: t.label, rate: String(t.rate) })));
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function update(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
    setStatus(null);
  }

  function remove(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
    setStatus(null);
  }

  function add() {
    setRows((r) => [...r, { label: "", rate: "" }]);
    setStatus(null);
  }

  function save() {
    startTransition(async () => {
      const payload = rows.map((r) => ({ label: r.label, rate: r.rate.trim() === "" ? Number.NaN : Number(r.rate) }));
      const res = await saveTaxesAction(payload);
      setStatus(res.ok ? { ok: true, text: res.message ?? "Saved" } : { ok: false, text: res.error ?? "Error" });
    });
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-muted">No taxes — bookings are charged the rental price only.</p>
      )}

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_7rem_auto] items-end gap-3">
          <label className="block">
            {i === 0 && <span className="mb-1.5 block text-xs font-medium text-muted">Name</span>}
            <input
              value={row.label}
              maxLength={40}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="e.g. NYC sales tax"
              className={inputCls}
            />
          </label>
          <label className="block">
            {i === 0 && <span className="mb-1.5 block text-xs font-medium text-muted">% of rental</span>}
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.001"
              value={row.rate}
              onChange={(e) => update(i, { rate: e.target.value })}
              placeholder="0"
              className={inputCls}
            />
          </label>
          <button
            type="button"
            onClick={() => remove(i)}
            className="rounded border border-line px-3 py-2.5 text-xs text-muted hover:border-danger/50 hover:text-danger"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={add}
          disabled={rows.length >= 10}
          className="rounded border border-line px-4 py-2.5 text-sm text-muted hover:border-accent/50 hover:text-fg disabled:opacity-50"
        >
          + Add tax
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="cta-cut bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save taxes"}
        </button>
        {status && (
          <span className={`text-sm ${status.ok ? "text-success" : "text-danger"}`}>{status.text}</span>
        )}
      </div>
    </div>
  );
}
