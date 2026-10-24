"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  DEFAULT_PICKUP_AREA,
  SAME_AS_PICKUP,
  DEFAULT_TIME,
} from "@/lib/booking-options";

/** The in-progress booking the hero search bar builds and hands to the modal. */
export type BookingDraft = {
  pickupLocation: string;
  returnLocation: string; // may be SAME_AS_PICKUP
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  returnDate: string; // YYYY-MM-DD
  returnTime: string; // HH:MM
};

export const EMPTY_DRAFT: BookingDraft = {
  pickupLocation: DEFAULT_PICKUP_AREA,
  returnLocation: SAME_AS_PICKUP,
  pickupDate: "",
  pickupTime: DEFAULT_TIME,
  returnDate: "",
  returnTime: DEFAULT_TIME,
};

type FleetFilterValue = {
  category: string;
  setCategory: (c: string) => void;
  draft: BookingDraft;
  setDraft: (d: BookingDraft) => void;
  /** merge into the draft, optionally set a category, and scroll to the fleet */
  applyAndScroll: (category: string, patch?: Partial<BookingDraft>) => void;
};

const FleetFilterContext = createContext<FleetFilterValue | null>(null);

export function FleetFilterProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategory] = useState("ALL");
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const scrolling = useRef(false);

  const applyAndScroll = useCallback(
    (c: string, patch?: Partial<BookingDraft>) => {
      setCategory(c);
      if (patch) setDraft((prev) => ({ ...prev, ...patch }));
      if (scrolling.current) return;
      scrolling.current = true;
      requestAnimationFrame(() => {
        document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
        window.setTimeout(() => (scrolling.current = false), 400);
      });
    },
    []
  );

  return (
    <FleetFilterContext.Provider
      value={{ category, setCategory, draft, setDraft, applyAndScroll }}
    >
      {children}
    </FleetFilterContext.Provider>
  );
}

export function useFleetFilter() {
  const ctx = useContext(FleetFilterContext);
  if (!ctx) throw new Error("useFleetFilter must be used inside FleetFilterProvider");
  return ctx;
}
