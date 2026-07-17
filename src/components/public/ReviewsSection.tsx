import Reveal from "./Reveal";

export type ReviewDTO = {
  id: string;
  name: string;
  vehicle: string | null;
  rating: number;
  text: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < rating ? "fill-accent-bright" : "fill-line"}`}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsSection({
  reviews,
  avgRating,
}: {
  reviews: ReviewDTO[];
  avgRating: number;
}) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="scroll-mt-20 border-t border-line/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-2 flex items-center gap-3 text-xs font-semibold tracking-[0.4em] text-accent-bright">
                <span className="inline-block h-px w-10 bg-accent" />
                REVIEWS
              </p>
              <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em]">
                People keep coming back
              </h2>
            </div>
            <div className="card flex items-center gap-3 px-5 py-3">
              <span className="font-display text-3xl font-bold">
                {avgRating.toFixed(1)}
              </span>
              <div>
                <Stars rating={Math.round(avgRating)} />
                <p className="mt-1 text-xs text-muted">
                  from {reviews.length} rider{reviews.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 90}>
              <figure
                className={`card flex h-full flex-col p-6 ${
                  i % 3 === 1 ? "lg:translate-y-4" : ""
                }`}
              >
                <Stars rating={r.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-fg/90">
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line/60 pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-dim font-display text-sm font-bold text-accent-bright">
                    {r.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{r.name}</span>
                    {r.vehicle && (
                      <span className="block text-xs text-muted">
                        rented the {r.vehicle}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
