"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Wordmark from "./Wordmark";

const LINKS = [
  { href: "/#fleet", label: "Fleet" },
  { href: "/#how", label: "How it works" },
  { href: "/#about", label: "About us" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
];

export default function Navbar({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // solid frosted bar once scrolled (or menu open); otherwise a soft gradient
  // that melts into the hero — no hard top edge
  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        solid
          ? "bg-bg/85 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          : "bg-gradient-to-b from-bg via-bg/70 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group">
          <Wordmark size="sm" />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="btn btn-primary px-5 py-2 text-sm"
            style={{ borderRadius: 9999 }}
          >
            {phone}
          </a>
          <ThemeToggle />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-fg transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-fg transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-fg transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* soft fading hairline (transparent at the edges) instead of a hard border */}
      {solid && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      )}

      {open && (
        <div className="border-t border-line/60 bg-bg/95 px-4 pb-4 backdrop-blur-md md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/40 py-3 text-sm text-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex items-center gap-3">
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="btn btn-primary flex-1 py-3 text-sm"
            >
              Call {phone}
            </a>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
