import Reveal from "./Reveal";

export default function LongTermSection({
  phone,
  email,
  monthlyFrom,
}: {
  phone: string;
  email: string;
  monthlyFrom: string;
}) {
  const tel = phone.replace(/[^+\d]/g, "");
  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    "Long-term / monthly rental enquiry"
  )}&body=${encodeURIComponent(
    "Hi Apex,\n\nI'm interested in a long-term (monthly) rental.\n\n- Vehicle / category: \n- Start date: \n- How long (weeks/months): \n- Pickup or delivery address: \n\nCould you send me a tailored monthly price? Thanks!"
  )}`;
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Reveal>
        <div className="premium-panel flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p
              className="mb-1.5 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--color-gold)" }}
            >
              Long-term &amp; monthly
            </p>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">
              Need it for a month or more?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Discounted weekly and monthly rates for insurance replacements,
              rideshare drivers and extended stays. Tell us how long — we&apos;ll
              tailor a price.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <span className="font-display text-3xl font-extrabold">
              from ${monthlyFrom}
              <span className="text-base font-medium text-muted">/mo</span>
            </span>
            <div className="flex flex-wrap gap-2.5">
              <a href={`tel:${tel}`} className="btn btn-primary px-6 py-3 text-sm">
                Call us
              </a>
              <a href={mailto} className="btn btn-ghost px-6 py-3 text-sm">
                Email us
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
