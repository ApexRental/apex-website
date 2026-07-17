import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Choose your car",
    body: "Browse the fleet, compare rates and pick the vehicle that fits your trip — economy to premium.",
  },
  {
    n: "02",
    title: "Send a request",
    body: "Pick your dates and send a booking request. No prepayment online — we confirm availability first.",
  },
  {
    n: "03",
    title: "Drive your journey",
    body: "We arrange pickup, you sign the rental agreement, leave a refundable deposit and hit the road.",
  },
];

/* Thin line icons (1.6px stroke) — no emoji, consistent weight. */
const ICONS: Record<string, React.ReactNode> = {
  license: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M13 10h5M13 13.5h5M5.5 15.5c.6-1.3 1.7-2 3-2s2.4.7 3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18M6.5 15h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </>
  ),
};

const REQUIREMENTS = [
  { icon: "license", label: "Valid driver license", note: "Held 1+ year" },
  { icon: "shield", label: "Full-coverage insurance", note: "Proof shown at pickup" },
  { icon: "card", label: "Refundable deposit", note: "$200–$500 · up to $1,000 luxury" },
  { icon: "calendar", label: "20 years or older", note: "Valid photo ID" },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-y border-line/60 bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent-bright">
            <span className="inline-block h-px w-10 bg-accent" />
            How it works
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em]">
            Three steps to the road
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative border-l-2 border-accent/40 pl-6">
                <span className="font-display text-sm font-bold tracking-widest text-accent-bright">
                  {s.n}
                </span>
                <h3 className="font-display mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            What you&apos;ll need
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REQUIREMENTS.map((r, i) => (
              <Reveal key={r.label} delay={i * 80}>
                <div className="card card-hover flex h-full items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent-dim/50 text-accent-bright">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {ICONS[r.icon]}
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-fg">{r.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{r.note}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
