export default function ContactSection({
  phone,
  email,
  serviceArea,
  hours,
}: {
  phone: string;
  email: string;
  serviceArea: string;
  hours: string;
}) {
  const areas = serviceArea.split("·").map((s) => s.trim()).filter(Boolean);
  const tel = phone.replace(/[^+\d]/g, "");
  return (
    <section id="contact" className="hero-glow scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="mb-2 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-accent-bright">
          <span className="inline-block h-px w-10 bg-accent" />
          Contact
          <span className="inline-block h-px w-10 bg-accent" />
        </p>
        <h2 className="font-display text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl">
          Ready when you are
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Call or email and we&apos;ll usually have your car ready the same day —
          {hours ? ` ${hours.toLowerCase()}.` : "."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={`tel:${tel}`} className="btn btn-primary px-7 py-3.5 text-sm">
            Call {phone}
          </a>
          <a href={`mailto:${email}`} className="btn btn-ghost px-7 py-3.5 text-sm">
            Email us
          </a>
        </div>

        {areas.length > 0 && (
          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted/70">
              Where we drive
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {areas.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-fg"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
