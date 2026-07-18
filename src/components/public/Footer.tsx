import Link from "next/link";
import Image from "next/image";
import Wordmark from "./Wordmark";

const EXPLORE = [
  { href: "/#fleet", label: "Fleet" },
  { href: "/#how", label: "How it works" },
  { href: "/#about", label: "About us" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
  { href: "/terms", label: "Rental terms" },
];

export default function Footer({
  companyName,
  tagline,
  phone,
  email,
  hours,
}: {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  hours: string;
}) {
  const tel = phone.replace(/[^+\d]/g, "");
  return (
    <footer className="border-t border-line/60 bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        {/* brand */}
        <div>
          <Wordmark size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            A small NYC garage renting clean, reliable cars — from everyday
            sedans to the Genesis GV70. {tagline}.
          </p>
        </div>

        {/* explore */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted/70">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition-colors hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted/70">
            Contact
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`tel:${tel}`} className="text-fg transition-colors hover:text-accent-bright">
                {phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${email}`}
                title={email}
                className="text-[13px] leading-snug text-muted transition-colors hover:text-fg"
                style={{ wordBreak: "normal", overflowWrap: "anywhere" }}
              >
                {email}
              </a>
            </li>
            <li className="text-muted">{hours}</li>
          </ul>
        </div>

        {/* service area */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted/70">
            Service area
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>New York City</li>
            <li>New Jersey</li>
            <li>Connecticut</li>
            <li>Pennsylvania</li>
          </ul>
          <p className="mt-3 text-xs text-muted/60">Airport delivery available</p>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted/60 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {companyName}. All rights reserved.{" "}
            <Link href="/terms" className="hover:text-fg">
              Terms &amp; Conditions
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:text-fg">
              Privacy
            </Link>
          </p>
          <span className="flex items-center gap-2 text-muted/60">
            <span>powered by</span>
            {/* white logo on the dark theme, black logo on the light theme */}
            <Image
              src="/onpoint-dark.png"
              alt="On Point Analytics"
              width={515}
              height={513}
              className="onpoint-on-dark h-5 w-auto"
            />
            <Image
              src="/onpoint-light.png"
              alt="On Point Analytics"
              width={513}
              height={504}
              className="onpoint-on-light h-5 w-auto"
            />
            <span className="font-semibold tracking-wide text-muted">
              On Point Analytics
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
