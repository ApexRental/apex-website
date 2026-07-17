import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rental Terms & Conditions — Apex Rentals",
};

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <>
      <Navbar phone={settings.phone} />
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <p className="mb-2 flex items-center gap-3 text-xs font-semibold tracking-[0.4em] text-accent-bright">
            <span className="inline-block h-px w-10 bg-accent" />
            APEX RENT A CAR
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Rental Terms &amp; Conditions
          </h1>

          {settings.depositNote && (
            <div className="mt-8 rounded-lg border border-accent/40 bg-accent-dim/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-bright">
                Security deposit
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg">
                {settings.depositNote}
              </p>
            </div>
          )}

          <ol className="mt-10 grid gap-4 sm:grid-cols-2">
            {settings.terms.map((t, i) => (
              <li key={i} className="card flex gap-4 p-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-dim/50 font-display text-sm font-bold text-accent-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold">{t.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-12 text-sm leading-relaxed text-muted/80">
            By signing the rental agreement at pickup, the renter confirms they
            have read, understood, and agreed to all terms above. Questions?
            Call {settings.phone} or email {settings.email}.
          </p>
        </div>
      </main>
      <Footer
        companyName={settings.companyName}
        tagline={settings.tagline}
        phone={settings.phone}
        email={settings.email}
        hours={settings.hours}
      />
    </>
  );
}
