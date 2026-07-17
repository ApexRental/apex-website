"use client";

import { useActionState, useState, useTransition } from "react";
import {
  saveReviewAction,
  deleteReviewAction,
  toggleReviewVisibilityAction,
  type ActionResult,
} from "@/lib/actions";

export type ReviewItem = {
  id: string;
  name: string;
  vehicle: string | null;
  rating: number;
  text: string;
  isVisible: boolean;
};

const inputCls =
  "w-full rounded border border-line bg-raised px-3 py-2.5 text-sm outline-none placeholder:text-muted/50 focus:border-accent";

export default function ReviewManager({ reviews }: { reviews: ReviewItem[] }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveReviewAction,
    null
  );

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Add a review</h2>
        <form action={formAction} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <input name="name" required placeholder="Client name *" className={inputCls} />
            <input name="vehicle" placeholder="Vehicle (e.g. BMW 530i)" className={inputCls} />
            <select name="rating" defaultValue="5" className={inputCls}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)}{"☆".repeat(5 - n)} — {n}/5
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="text"
            required
            rows={3}
            placeholder="Review text *"
            className={`${inputCls} resize-y`}
          />
          <div className="flex items-center gap-3">
            <button
              disabled={pending}
              className="cta-cut bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-bright disabled:opacity-50"
            >
              {pending ? "Saving…" : "Add review"}
            </button>
            {state &&
              (state.ok ? (
                <span className="text-sm text-success">{state.message}</span>
              ) : (
                <span className="text-sm text-danger">{state.error}</span>
              ))}
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-line bg-surface">
        {reviews.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No reviews yet.</p>
        ) : (
          <ul>
            {reviews.map((r) => (
              <ReviewRow key={r.id} review={r} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewRow({ review }: { review: ReviewItem }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-line/60 px-5 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {review.name}
          <span className="ml-2 text-accent-bright">
            {"★".repeat(review.rating)}
          </span>
          {review.vehicle && (
            <span className="ml-2 text-xs text-muted">{review.vehicle}</span>
          )}
          {!review.isVisible && (
            <span className="ml-2 rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">
              hidden
            </span>
          )}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{review.text}</p>
      </div>

      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleReviewVisibilityAction(review.id))}
        className="rounded border border-line px-3 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-fg disabled:opacity-50"
      >
        {review.isVisible ? "Hide" : "Show"}
      </button>

      {confirming ? (
        <span className="flex items-center gap-2">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteReviewAction(review.id);
              })
            }
            className="rounded border border-danger/50 bg-danger/10 px-3 py-1.5 text-xs text-danger disabled:opacity-50"
          >
            Confirm
          </button>
          <button onClick={() => setConfirming(false)} className="text-xs text-muted hover:text-fg">
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
