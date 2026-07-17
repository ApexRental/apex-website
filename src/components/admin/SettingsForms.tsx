"use client";

import { useActionState } from "react";
import {
  saveContactSettingsAction,
  changePasswordAction,
  type ActionResult,
} from "@/lib/actions";
import type { SiteSettings } from "@/lib/settings";

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

function Feedback({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return state.ok ? (
    <span className="text-sm text-success">{state.message}</span>
  ) : (
    <span className="text-sm text-danger">{state.error}</span>
  );
}

export function ContactForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveContactSettingsAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name">
          <input name="companyName" defaultValue={settings.companyName} className={inputCls} />
        </Field>
        <Field label="Tagline">
          <input name="tagline" defaultValue={settings.tagline} className={inputCls} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={settings.phone} className={inputCls} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" defaultValue={settings.email} className={inputCls} />
        </Field>
      </div>
      <Field label="Service area (separate with ·)">
        <input name="serviceArea" defaultValue={settings.serviceArea} className={inputCls} />
      </Field>
      <Field label="Deposit note (shown on the site)">
        <textarea
          name="depositNote"
          rows={2}
          defaultValue={settings.depositNote}
          className={`${inputCls} resize-none`}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Working hours">
          <input name="hours" defaultValue={settings.hours} className={inputCls} />
        </Field>
        <Field label="Monthly rate — from $ (long-term band)">
          <input name="monthlyFrom" defaultValue={settings.monthlyFrom} className={inputCls} />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="cta-cut bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-bright disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save contact info"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    changePasswordAction,
    null
  );

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <Field label="Current password">
        <input name="current" type="password" required className={inputCls} />
      </Field>
      <Field label="New password (min 8 characters)">
        <input name="next" type="password" required minLength={8} className={inputCls} />
      </Field>
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded border border-line px-5 py-2.5 text-sm font-semibold hover:border-accent/50 disabled:opacity-50"
        >
          {pending ? "Updating…" : "Change password"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
