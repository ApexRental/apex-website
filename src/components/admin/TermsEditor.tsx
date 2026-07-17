"use client";

import { useState, useTransition } from "react";
import { saveTermsAction } from "@/lib/actions";
import type { TermItem } from "@/lib/settings";

export default function TermsEditor({ initial }: { initial: TermItem[] }) {
  const [terms, setTerms] = useState<TermItem[]>(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function update(i: number, patch: Partial<TermItem>) {
    setTerms((t) => t.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
    setStatus(null);
  }

  function move(i: number, dir: -1 | 1) {
    setTerms((t) => {
      const next = [...t];
      const j = i + dir;
      if (j < 0 || j >= next.length) return t;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setStatus(null);
  }

  function remove(i: number) {
    setTerms((t) => t.filter((_, idx) => idx !== i));
    setStatus(null);
  }

  function save() {
    startTransition(async () => {
      const res = await saveTermsAction(JSON.stringify(terms));
      setStatus(
        res.ok
          ? { ok: true, text: res.message ?? "Saved" }
          : { ok: false, text: res.error ?? "Error" }
      );
    });
  }

  return (
    <div className="space-y-4">
      {terms.map((t, i) => (
        <div key={i} className="rounded-lg border border-line bg-raised/40 p-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-bold text-accent-bright">
              {String(i + 1).padStart(2, "0")}
            </span>
            <input
              value={t.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Term title"
              className="flex-1 rounded border border-line bg-surface px-3 py-2 text-sm font-semibold outline-none focus:border-accent"
            />
            <button onClick={() => move(i, -1)} disabled={i === 0} className={miniBtn} title="Move up">↑</button>
            <button onClick={() => move(i, 1)} disabled={i === terms.length - 1} className={miniBtn} title="Move down">↓</button>
            <button
              onClick={() => remove(i)}
              className="rounded border border-line px-2.5 py-1.5 text-xs text-muted hover:border-danger/50 hover:text-danger"
              title="Delete term"
            >
              ✕
            </button>
          </div>
          <textarea
            value={t.body}
            onChange={(e) => update(i, { body: e.target.value })}
            rows={2}
            placeholder="Term text"
            className="mt-2 w-full resize-y rounded border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setTerms((t) => [...t, { title: "", body: "" }]);
            setStatus(null);
          }}
          className="rounded border border-line px-4 py-2 text-sm text-muted hover:border-accent/50 hover:text-fg"
        >
          + Add term
        </button>
        <button
          onClick={save}
          disabled={pending}
          className="cta-cut bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save terms"}
        </button>
        {status && (
          <span className={`text-sm ${status.ok ? "text-success" : "text-danger"}`}>
            {status.text}
          </span>
        )}
      </div>
    </div>
  );
}

const miniBtn =
  "rounded border border-line px-2.5 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-fg disabled:opacity-30";
