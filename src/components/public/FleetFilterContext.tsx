"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Dates = { pickup: string; return: string };

type FleetFilterValue = {
  category: string;
  setCategory: (c: string) => void;
  dates: Dates;
  setDates: (d: Dates) => void;
  /** set category + dates and scroll to the fleet grid */
  applyAndScroll: (c: string, d: Dates) => void;
};

const FleetFilterContext = createContext<FleetFilterValue | null>(null);

export function FleetFilterProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategory] = useState("ALL");
  const [dates, setDates] = useState<Dates>({ pickup: "", return: "" });
  const scrolling = useRef(false);

  const applyAndScroll = useCallback((c: string, d: Dates) => {
    setCategory(c);
    setDates(d);
    if (scrolling.current) return;
    scrolling.current = true;
    requestAnimationFrame(() => {
      document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => (scrolling.current = false), 400);
    });
  }, []);

  return (
    <FleetFilterContext.Provider
      value={{ category, setCategory, dates, setDates, applyAndScroll }}
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
