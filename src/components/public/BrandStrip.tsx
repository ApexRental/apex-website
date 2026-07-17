import { siHyundai, siHonda, siJeep, siBmw } from "simple-icons";

/* Genesis-style winged crest (not in simple-icons) — a central shield flanked
   by fanned, tapering feather bars sweeping up and out. */
function GenesisWings() {
  const feathers = [
    { y: 7.5, len: 17, w: 1.7 },
    { y: 9.4, len: 21, w: 1.5 },
    { y: 11.3, len: 23, w: 1.3 },
    { y: 13.2, len: 20, w: 1.1 },
    { y: 15.0, len: 15, w: 0.9 },
  ];
  return (
    <svg viewBox="0 0 100 26" className="h-6 w-[3.4rem]" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        {/* left wing */}
        {feathers.map((f, i) => (
          <line
            key={`l${i}`}
            x1={44}
            y1={f.y + 1}
            x2={44 - f.len}
            y2={f.y - 2.5}
            strokeWidth={f.w}
          />
        ))}
        {/* right wing */}
        {feathers.map((f, i) => (
          <line
            key={`r${i}`}
            x1={56}
            y1={f.y + 1}
            x2={56 + f.len}
            y2={f.y - 2.5}
            strokeWidth={f.w}
          />
        ))}
      </g>
      {/* central shield/crest */}
      <path
        d="M50 4 L54 7 V13 Q54 17 50 19 Q46 17 46 13 V7 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Only the marques Apex actually rents. */
const BRANDS: { title: string; path?: string; custom?: React.ReactNode }[] = [
  { title: "Hyundai", path: siHyundai.path },
  { title: "Honda", path: siHonda.path },
  { title: "Jeep", path: siJeep.path },
  { title: "BMW", path: siBmw.path },
  { title: "Genesis", custom: <GenesisWings /> },
];

export default function BrandStrip() {
  return (
    <section className="border-y border-line/60 bg-surface/40 py-7">
      <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-muted/60">
        Brands in our fleet
      </p>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-6 px-4">
        {BRANDS.map((b) => (
          <div
            key={b.title}
            className="flex items-center gap-3 text-muted/70 transition-colors hover:text-fg"
            title={b.title}
          >
            {b.path ? (
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
                <path d={b.path} />
              </svg>
            ) : (
              b.custom
            )}
            <span className="text-sm font-semibold uppercase tracking-[0.25em]">
              {b.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
