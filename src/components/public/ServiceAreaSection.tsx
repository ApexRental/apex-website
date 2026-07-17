import Reveal from "./Reveal";

const ZONES = [
  { title: "Brooklyn & Queens", places: "Williamsburg · LIC · Astoria · Bay Ridge" },
  { title: "Manhattan", places: "Midtown · FiDi · UES/UWS · Chelsea · Harlem" },
  { title: "Staten Island & Long Island", places: "Within a 20-mile radius" },
];

export default function ServiceAreaSection() {
  return (
    <section id="delivery" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent-bright">
                <span className="inline-block h-px w-10 bg-accent" />
                Delivery &amp; pickup
              </p>
              <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em]">
                We come to you
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted">
                Skip the counter. We deliver and pick up at your address across
                the city — and meet arriving flights at JFK and LaGuardia. Just
                send your flight number with the booking.
              </p>

              <div className="mt-6 space-y-3">
                <div className="card flex items-start gap-3 p-4">
                  <span className="text-success">✓</span>
                  <p className="text-sm text-fg/90">
                    <span className="font-semibold">Free</span>{" "}
                    delivery &amp; pickup within a 20-mile radius (Brooklyn,
                    Queens, Manhattan,
                    Staten Island, Long Island) — no toll roads.
                  </p>
                </div>
                <div className="card flex items-start gap-3 p-4">
                  <span className="text-accent-bright">$50</span>
                  <p className="text-sm text-muted">
                    If a delivery needs toll roads and is over 10 miles, a $50 fee
                    applies and tolls are covered by the renter.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {ZONES.map((z, i) => (
                <Reveal key={z.title} delay={i * 90} className="h-full">
                  <div className="card h-full p-5">
                    <h3 className="font-display font-bold">{z.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {z.places}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
