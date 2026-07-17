import Link from "next/link";
import { TermItem } from "@/lib/settings";
import Reveal from "./Reveal";

export default function TermsPreview({
  terms,
  depositNote,
}: {
  terms: TermItem[];
  depositNote: string;
}) {
  const preview = terms.slice(0, 4);
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent-bright">
            <span className="inline-block h-px w-10 bg-accent" />
            Good to know
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em]">
            Clear terms, no surprises
          </h2>
          {depositNote && (
            <p className="mt-5 border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-muted">
              {depositNote}
            </p>
          )}
          <Link
            href="/terms"
            className="btn btn-ghost mt-8 px-6 py-3 text-sm"
          >
            Read full terms →
          </Link>
        </div>

        <ul className="space-y-3">
          {preview.map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <li className="card card-hover flex gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-dim/50 font-display text-sm font-bold text-accent-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display font-bold">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
