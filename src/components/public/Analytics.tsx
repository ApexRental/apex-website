"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Consent = "granted" | "denied" | null;

/**
 * Google Analytics 4 + a lightweight cookie-consent banner.
 * GA only loads AFTER the visitor accepts (privacy-friendly). Renders nothing
 * at all until NEXT_PUBLIC_GA_ID is set, so no empty banner in dev.
 */
export default function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const pathname = usePathname();

  // read saved choice
  useEffect(() => {
    if (!GA_ID) return;
    try {
      const saved = localStorage.getItem("cookie-consent");
      if (saved === "granted" || saved === "denied") setConsent(saved);
    } catch {}
  }, []);

  // send a page_view on client-side route changes (only after consent)
  useEffect(() => {
    if (consent !== "granted" || !GA_ID) return;
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    if (w.gtag) w.gtag("config", GA_ID, { page_path: pathname });
  }, [pathname, consent]);

  if (!GA_ID) return null;

  const choose = (v: Exclude<Consent, null>) => {
    try {
      localStorage.setItem("cookie-consent", v);
    } catch {}
    setConsent(v);
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {consent === null && (
        <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
          <div className="card mx-auto flex max-w-3xl flex-col gap-3 p-4 shadow-2xl shadow-black/40 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-sm leading-relaxed text-muted">
              We use cookies to understand site traffic and improve your
              experience.{" "}
              <Link href="/privacy" className="text-accent-bright hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2.5">
              <button
                onClick={() => choose("denied")}
                className="btn btn-ghost px-4 py-2 text-sm"
              >
                Decline
              </button>
              <button
                onClick={() => choose("granted")}
                className="btn btn-primary px-5 py-2 text-sm"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
