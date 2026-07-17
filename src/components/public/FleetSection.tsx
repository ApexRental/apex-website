"use client";

import { useMemo, useState } from "react";
import { CarDTO } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/format";
import CarCard from "./CarCard";
import CarGallery from "./CarGallery";
import BookingModal from "./BookingModal";
import Reveal from "./Reveal";
import { useFleetFilter } from "./FleetFilterContext";

/** Repeat a list until it has at least `min` items (for seamless marquees). */
function padTo<T>(items: T[], min: number): T[] {
  if (items.length === 0) return items;
  const out: T[] = [];
  while (out.length < min) out.push(...items);
  return out;
}

function Row({
  cars,
  reverse,
  onBook,
  onView,
}: {
  cars: CarDTO[];
  reverse?: boolean;
  onBook: (c: CarDTO) => void;
  onView: (c: CarDTO) => void;
}) {
  const unit = padTo(cars, 6);
  const loop = [...unit, ...unit];
  return (
    <div className="row-marquee">
      <div className={`row-track py-2 ${reverse ? "rev" : ""}`}>
        {loop.map((car, i) => (
          <div key={`${car.id}-${i}`} className="w-[290px] shrink-0 sm:w-[320px]">
            <CarCard car={car} onBook={onBook} onView={onView} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FleetSection({ cars }: { cars: CarDTO[] }) {
  const { category, setCategory, dates } = useFleetFilter();
  const [selected, setSelected] = useState<CarDTO | null>(null);
  const [viewing, setViewing] = useState<CarDTO | null>(null);

  const categories = useMemo(() => {
    const present = Array.from(new Set(cars.map((c) => c.category)));
    return ["ALL", ...present];
  }, [cars]);

  const activeFilter = categories.includes(category) ? category : "ALL";
  const filtered = cars.filter((c) => c.category === activeFilter);
  const premium = cars.filter((c) => c.category === "PREMIUM");
  const everyday = cars.filter((c) => c.category !== "PREMIUM");

  return (
    <section id="fleet" className="scroll-mt-24 py-20">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent-bright">
              <span className="inline-block h-px w-10 bg-accent" />
              The fleet
            </p>
            <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em]">
              Pick your ride
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeFilter === cat
                    ? "border-accent bg-accent-dim text-accent-bright"
                    : "border-line text-muted hover:border-accent/50 hover:text-fg"
                }`}
              >
                {cat === "ALL" ? "All" : CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeFilter === "ALL" ? (
        <>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Row cars={everyday} onBook={setSelected} onView={setViewing} />
          </div>

          {premium.length > 0 && (
            <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
              <Reveal>
                <div className="premium-panel overflow-hidden p-6 sm:p-9">
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p
                        className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em]"
                        style={{ color: "var(--color-gold)" }}
                      >
                        <span
                          className="inline-block h-px w-10"
                          style={{ background: "var(--color-gold)" }}
                        />
                        The Premium Collection
                      </p>
                      <h3 className="font-display text-3xl font-extrabold tracking-[-0.02em]">
                        A step above
                      </h3>
                      <p className="mt-2 max-w-md text-sm text-muted">
                        Leather, quiet power and presence — for the wedding, the
                        client dinner, the weekend that matters.
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                      style={{
                        color: "var(--color-gold)",
                        borderColor: "rgba(217,182,118,0.4)",
                      }}
                    >
                      Chauffeur available
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {premium.map((car, i) => (
                      <Reveal key={car.id} delay={i * 90} className="h-full">
                        <CarCard car={car} onBook={setSelected} onView={setViewing} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          )}
        </>
      ) : (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted">
              No vehicles in this category right now — check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((car, i) => (
                <Reveal key={car.id} delay={(i % 3) * 80} className="h-full">
                  <CarCard car={car} onBook={setSelected} onView={setViewing} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}

      {viewing && (
        <CarGallery
          car={viewing}
          onClose={() => setViewing(null)}
          onBook={setSelected}
        />
      )}

      {selected && (
        <BookingModal
          car={selected}
          initialDates={dates}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
