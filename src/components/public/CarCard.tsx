import Image from "next/image";
import { CarDTO } from "@/lib/types";
import { CATEGORY_LABELS, money } from "@/lib/format";
import CarSilhouette from "./CarSilhouette";

export default function CarCard({
  car,
  onBook,
  onView,
}: {
  car: CarDTO;
  onBook: (car: CarDTO) => void;
  onView?: (car: CarDTO) => void;
}) {
  const photoCount = car.images.length || (car.imageUrl ? 1 : 0);
  const canView = Boolean(onView) && photoCount > 0;

  return (
    <article className="card car-card group flex h-full flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => canView && onView!(car)}
        disabled={!canView}
        aria-label={`View ${car.make} ${car.model} photos`}
        className="card-media relative block h-52 w-full overflow-hidden bg-raised/50 text-left disabled:cursor-default"
      >
        {car.imageUrl ? (
          <Image
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            fill
            sizes="(max-width: 640px) 90vw, 340px"
            unoptimized={car.imageUrl.startsWith("http")}
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6">
            <CarSilhouette category={car.category} />
          </div>
        )}

        {/* legibility gradient at the base of the photo (theme-aware: gentle on light so it doesn't wash the car) */}
        <div className="card-media-fade pointer-events-none absolute inset-x-0 bottom-0 h-24" />

        {/* category chip */}
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
          {CATEGORY_LABELS[car.category] ?? car.category}
        </span>

        {/* photo-count / view-gallery chip */}
        {canView && photoCount > 1 && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md transition-colors group-hover:border-white/40">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {photoCount}
          </span>
        )}

        {/* price pill */}
        <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 font-display text-sm font-bold text-white backdrop-blur-md">
          {money(car.dailyRate)}
          <span className="font-medium text-white/70"> /day</span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold tracking-[-0.01em]">
          {car.make} {car.model}
          <span className="ml-2 text-sm font-medium text-muted">{car.year}</span>
        </h3>

        <p className="mt-1 text-xs text-muted">
          {car.seats} seats · {car.transmission} · {car.fuel}
        </p>

        {car.features.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {car.features.slice(0, 3).map((f) => (
              <li
                key={f}
                className="rounded-md border border-line/70 px-2 py-0.5 text-[10px] tracking-wide text-muted"
              >
                {f}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => onBook(car)}
          className="btn btn-primary mt-5 w-full py-3 text-sm"
        >
          Book this car
        </button>
      </div>
    </article>
  );
}
