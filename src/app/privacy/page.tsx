import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy — Apex Rentals",
  description:
    "How Apex Rentals collects, uses, and protects the information you share when you request a booking.",
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  const sections: { h: string; body: React.ReactNode }[] = [
    {
      h: "What we collect",
      body: (
        <>
          When you send a booking request or contact us, we collect the details
          you provide: your name, phone number, email address, driver&apos;s
          license number (if you choose to share it), your requested pickup and
          return dates, the vehicle you&apos;re interested in, and any message
          you add. We don&apos;t collect payment card details through this
          website.
        </>
      ),
    },
    {
      h: "How we use it",
      body: (
        <>
          We use this information only to respond to your enquiry, arrange and
          manage your rental, verify eligibility at pickup, and contact you about
          your booking. We do not sell or rent your personal information to
          anyone.
        </>
      ),
    },
    {
      h: "Who we share it with",
      body: (
        <>
          We share your information only with service providers that help us
          operate — for example, our email provider used to deliver booking
          notifications — and only as needed to run the rental. We may disclose
          information if required by law.
        </>
      ),
    },
    {
      h: "Cookies & analytics",
      body: (
        <>
          This site uses only essential storage needed for it to work (for
          example, remembering your light/dark theme preference and keeping an
          admin signed in). We don&apos;t use advertising trackers.
        </>
      ),
    },
    {
      h: "Data retention",
      body: (
        <>
          We keep booking records for as long as needed to provide the rental
          and to meet our legal, tax, and accounting obligations, then delete or
          anonymise them.
        </>
      ),
    },
    {
      h: "Your choices",
      body: (
        <>
          You can ask us what information we hold about you, correct it, or
          request deletion. To make a request, call {settings.phone} or email{" "}
          {settings.email}.
        </>
      ),
    },
  ];

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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            This policy explains what information {settings.companyName} collects
            through this website and how we use it. By sending a booking request,
            you agree to this policy.
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={i} className="card flex gap-4 p-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-dim/50 font-display text-sm font-bold text-accent-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold">{s.h}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-12 text-sm leading-relaxed text-muted/80">
            Questions about your privacy? Call {settings.phone} or email{" "}
            {settings.email}.
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
