"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFleetFilter } from "./FleetFilterContext";

type Slide = {
  image: string;
  focus: string; // object-position for the car
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  category: string;
};

const SLIDES: Slide[] = [
  {
    image: "/images/fleet/x5-1.jpg",
    focus: "center center",
    eyebrow: "Car rental · New York City",
    title: "Drive your journey",
    sub: "A hand-picked fleet from everyday sedans to the BMW X5 — clean, ready, and yours the same day. No counter lines, no games.",
    cta: "Browse the fleet",
    category: "ALL",
  },
  {
    image: "/images/fleet/gv70-1.jpg",
    focus: "center center",
    eyebrow: "The Premium collection",
    title: "Arrive in a Genesis",
    sub: "The Genesis GV70 and BMW X5 — leather, quiet power and real presence for the days that count.",
    cta: "See premium",
    category: "PREMIUM",
  },
  {
    image: "/images/fleet/grand-cherokee-1.jpg",
    focus: "center center",
    eyebrow: "SUVs & crossovers",
    title: "Built for the detour",
    sub: "Grand Cherokee, Santa Fe and Tucson — three-row room and all-weather grip for the weekend out of town.",
    cta: "Browse SUVs",
    category: "SUV",
  },
  {
    image: "/images/fleet/sonata-1.jpg",
    focus: "center center",
    eyebrow: "Everyday rides",
    title: "Everyday, done right",
    sub: "The Sonata and Accord Hybrid — comfortable, efficient and easy on the wallet from $65 a day.",
    cta: "See the sedans",
    category: "SEDAN",
  },
];

const AUTOPLAY_MS = 6500;

export default function HeroCarousel({ rating }: { rating: number }) {
  const [index, setIndex] = useState(0);
  const { applyAndScroll } = useFleetFilter();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  const go = useCallback((n: number) => {
    setIndex((n + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => {
      if (!paused.current) setIndex((p) => (p + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <section
      className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-bg pt-16"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      aria-roledescription="carousel"
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-[1100ms] ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          {/* car photo — sits on the right, its left edge dissolves into the
              dark panel via a mask so there's no hard seam */}
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-[72%]"
            style={{
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 22%, #000 45%)",
              maskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 22%, #000 45%)",
            }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{
                objectPosition: slide.focus,
                transform: i === index ? "scale(1.05)" : "scale(1)",
                transition: "transform 7s ease-out",
                filter: "contrast(1.08) saturate(1.06)",
              }}
            />
          </div>
          {/* theme-aware scrims: page colour fades in from the left for text,
              clearing before the car so photos stay vivid (gentler on light) */}
          <div className="hero-scrim-x absolute inset-0" />
          <div className="hero-scrim-b absolute inset-0" />
        </div>
      ))}

      {/* faint texture + corner glow so the left panel never reads as empty */}
      <div className="dots pointer-events-none absolute inset-y-0 left-0 z-[1] w-1/2 opacity-40 [mask-image:linear-gradient(90deg,#000,transparent)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 z-[1] h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      {/* content */}
      <div className="relative z-[2] mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
        <div className="max-w-xl">
          {SLIDES.map((slide, i) =>
            i === index ? (
              <div key={slide.title}>
                <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent-bright">
                  <span className="inline-block h-px w-10 bg-accent" />
                  {slide.eyebrow}
                </p>
                <h1 className="hero-in font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.02em] text-fg sm:text-7xl">
                  {slide.title}
                </h1>
                <p className="hero-in-2 mt-6 max-w-md text-lg leading-relaxed text-fg/85">
                  {slide.sub}
                </p>
                <div className="hero-in-3 mt-9 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => applyAndScroll(slide.category, { pickup: "", return: "" })}
                    className="btn btn-primary px-8 py-4 text-sm"
                  >
                    {slide.cta}
                  </button>
                  <a href="#how" className="btn btn-ghost px-6 py-4 text-sm">
                    How it works
                  </a>
                </div>
              </div>
            ) : null
          )}

          {/* constant trust row — fills the left panel */}
          <dl className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-fg/10 pt-6 text-sm text-fg">
            <div className="flex items-center gap-2">
              <span className="text-accent-bright">★</span>
              <dt className="font-display font-bold">{rating.toFixed(1)}</dt>
              <dd className="text-muted">rider rating</dd>
            </div>
            <span className="h-4 w-px bg-fg/20" />
            <div className="flex items-center gap-2">
              <dt className="font-display font-bold">NY · NJ · CT · PA</dt>
            </div>
            <span className="hidden h-4 w-px bg-fg/20 sm:block" />
            <div className="flex items-center gap-2">
              <dt className="font-display font-bold">Same-day</dt>
              <dd className="text-muted">pickup</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* arrows */}
      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-8">
        <button
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/40"
        >
          ↑
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/40"
        >
          ↓
        </button>
      </div>

      {/* progress dots */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-8 sm:translate-x-0">
        {SLIDES.map((s, i) => (
          <button
            key={s.image}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all"
            style={{ width: i === index ? 40 : 16 }}
          >
            {i === index && (
              <span
                key={`fill-${index}`}
                className="absolute inset-0 origin-left rounded-full bg-accent-bright"
                style={{ animation: `dotfill ${AUTOPLAY_MS}ms linear` }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
