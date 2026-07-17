"use client";

import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );

  return (
    <main className="hero-glow flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm border border-line bg-surface p-8 sm:rounded-lg">
        <p className="font-display text-lg font-bold tracking-[0.18em]">
          APEX{" "}
          <span className="text-sm tracking-[0.42em] text-accent-bright">ADMIN</span>
        </p>
        <p className="mt-1 text-sm text-muted">Sign in to manage the site</p>

        <form action={formAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded border border-line bg-raised px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </label>

          {state?.error && (
            <p className="rounded border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="cta-cut w-full bg-accent py-3 font-display text-sm font-bold tracking-wider text-white hover:bg-accent-bright disabled:opacity-50"
          >
            {pending ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>
      </div>
    </main>
  );
}
