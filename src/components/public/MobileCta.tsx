"use client";

import { useEffect, useState } from "react";

/** Sticky bottom action bar on mobile — appears after the hero scrolls away. */
export default function MobileCta({ phone }: { phone: string }) {
  const [show, setShow] = useState(false);
  const tel = phone.replace(/[^+\d]/g, "");

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 620);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-bg/90 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex gap-3">
        <a href={`tel:${tel}`} className="btn btn-ghost flex-1 py-3 text-sm">
          Call
        </a>
        <a href="#fleet" className="btn btn-primary flex-1 py-3 text-sm">
          Book a car
        </a>
      </div>
    </div>
  );
}
