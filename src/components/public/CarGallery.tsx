"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CarDTO } from "@/lib/types";
import { CATEGORY_LABELS, money } from "@/lib/format";

export default function CarGallery({
  car,
  onClose,
  onBook,
}: {
  car: CarDTO;
  onClose: () => void;
  onBook: (car: CarDTO) => void;
}) {
  // gallery = explicit images, else fall back to the single cover
  const shots = car.images.length > 0 ? car.images : car.imageUrl ? [car.imageUrl] : [];
  const [i, setI] = useState(0);

  const go = useCallback(
    (n: number) => setI((p) => (n + shots.length) % shots.length),
    [shots.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(i - 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [i, go, onClose]);

  if (shots.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/85 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${car.make} ${car.model} photos`}
    >
      {/* header */}
      <div
        className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/80">
              {CATEGORY_LABELS[car.category] ?? car.category}
            </span>
            <span className="text-sm text-white/60">
              {i + 1} / {shots.length}
            </span>
          </div>
          <h3 className="mt-1.5 truncate font-display text-lg font-bold text-white sm:text-xl">
            {car.make} {car.model}
            <span className="ml-2 text-sm font-medium text-white/50">{car.year}</span>
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* main image */}
      <div
        className="relative flex flex-1 items-center justify-center px-2 sm:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full w-full max-w-5xl">
          <Image
            key={shots[i]}
            src={shots[i]}
            alt={`${car.make} ${car.model} — photo ${i + 1}`}
            fill
            sizes="100vw"
            unoptimized={shots[i].startsWith("http")}
            className="hero-in object-contain"
            priority
          />
        </div>

        {shots.length > 1 && (
          <>
            <button
              onClick={() => go(i - 1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/40 sm:left-6"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => go(i + 1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-accent/40 sm:right-6"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* footer: thumbnails + book */}
      <div
        className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {shots.map((src, idx) => (
            <button
              key={src}
              onClick={() => setI(idx)}
              aria-label={`Photo ${idx + 1}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all ${
                idx === i
                  ? "border-accent-bright opacity-100"
                  : "border-white/15 opacity-55 hover:opacity-90"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                unoptimized={src.startsWith("http")}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          <span className="font-display text-lg font-bold text-white">
            {money(car.dailyRate)}
            <span className="text-sm font-medium text-white/60"> /day</span>
          </span>
          {car.overbooked ? (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white/60"
            >
              Overbooked
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onBook(car);
              }}
              className="btn btn-primary px-6 py-3 text-sm"
            >
              Book this car
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
