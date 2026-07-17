import Image from "next/image";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

const POINTS = [
  {
    title: "Our own cars, not a broker",
    body: "Every vehicle on this site sits in our garage. No third-party hosts, no bait-and-switch at pickup — the car you book is the car you get.",
  },
  {
    title: "The price is the price",
    body: "Your quote is daily rate × days. Tolls and tickets are on you, everything else is spelled out in the agreement before you sign.",
  },
  {
    title: "A person picks up the phone",
    body: "Flight delayed into JFK at midnight? Call us. We move pickups, meet you at odd hours and answer texts — because we're drivers too.",
  },
];

export default function AboutSection({
  avgRating,
}: {
  avgRating: number;
}) {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Reveal>
              <p className="mb-2 flex items-center gap-3 text-xs font-semibold tracking-[0.4em] text-accent-bright">
                <span className="inline-block h-px w-10 bg-accent" />
                ABOUT US
              </p>
              <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em]">
                A small NYC garage that
                <br />
                does rentals right
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-muted">
                Apex started with a couple of sedans and a simple idea: renting a
                car in New York shouldn&apos;t feel like a hostage negotiation.
                Today we run everything from the Hyundai Sonata to the BMW X5,
                and we still answer every call ourselves.
              </p>
            </Reveal>

            <div className="mt-9 space-y-6">
              {POINTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 100}>
                  <div className="border-l-2 border-accent/40 pl-5">
                    <h3 className="font-display font-bold">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {p.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={150}>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="relative h-72 overflow-hidden sm:h-80">
                <Image
                  src="/images/about-journey.jpg"
                  alt="A family setting off on a road trip in an Apex rental"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  style={{ objectPosition: "center 18%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-xl border border-white/15 bg-black/45 px-4 py-3 backdrop-blur-md">
                  <p className="font-display text-sm font-bold text-white">
                    From everyday to premium
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">a car for every trip</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-line/60 border-t border-line/60">
                <div className="px-4 py-5 text-center">
                  <p className="font-display text-2xl font-bold text-fg">
                    <CountUp end={4} />
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">
                    states you can roam
                  </p>
                </div>
                <div className="px-4 py-5 text-center">
                  <p className="font-display text-2xl font-bold text-fg">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">
                    average rating
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
