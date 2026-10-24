import Reveal from "./Reveal";
import { describeTaxes, type TaxRate } from "@/lib/taxes";

const PAYMENT_Q = "How do I pay, and what's added to the daily rate?";

/** The payment answer lists the taxes currently set in Settings. */
function paymentAnswer(taxes: TaxRate[]): string {
  const charges = taxes.length > 0
    ? `the daily rate plus ${describeTaxes(taxes)}`
    : "the daily rate, with no extra taxes or fees";
  return `We take Zelle, Cash App, cash, and credit or debit cards. Your booking quote itemizes everything up front — ${charges} — so the total you see is the total you pay. A refundable security deposit is held separately at pickup.`;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "What do I need to rent a car?",
    a: "You must be 20 or older with a valid driver license held for at least a year, proof of your own full-coverage insurance (we don't sell CDW), and a card for the security deposit. The whole thing takes about ten minutes at pickup.",
  },
  {
    q: PAYMENT_Q,
    a: "", // filled from Settings at render time
  },
  {
    q: "How does the deposit work?",
    a: "A refundable deposit of $200–$500 depending on the vehicle, and up to $1,000 on luxury cars. It's released within 3–7 business days, subject to inspection at return. Bring it back the way you got it and there's nothing to talk about.",
  },
  {
    q: "Do you deliver the car?",
    a: "Yes — free delivery and pickup to your address within a 20-mile radius across Brooklyn, Queens, Manhattan, Staten Island and Long Island (no toll roads). If a delivery requires toll roads and is over 10 miles, a $50 delivery fee applies and tolls are on the renter. Airport meet-and-greet at JFK and LaGuardia too — just send your flight number.",
  },
  {
    q: "How many miles do I get?",
    a: "Unlimited mileage across New York and New Jersey. Planning to drive to another state? Ask us first — it needs written authorization.",
  },
  {
    q: "Can I cancel?",
    a: "Yes — free cancellation. Plans change; just let us know.",
  },
  {
    q: "Can I add another driver?",
    a: "Sure — additional drivers are $10 per day. They'll need to meet the same license and age requirements.",
  },
  {
    q: "Do you offer a chauffeur?",
    a: "Yes. A professional driver is available at $20 per hour or $200 per day — great for events, airport runs and business trips.",
  },
  {
    q: "What about fuel?",
    a: "Same-to-same: leave with a full tank, come back with a full tank (or half-to-half). If it comes back lower, we refuel it and add a service charge.",
  },
  {
    q: "Is anything charged when I send a booking request?",
    a: "No. The request just tells us what you want and when. We call or email to confirm availability, and payment happens at pickup when you sign the agreement.",
  },
];

export default function FaqSection({ taxes }: { taxes: TaxRate[] }) {
  const faqs = FAQS.map((f) => (f.q === PAYMENT_Q ? { ...f, a: paymentAnswer(taxes) } : f));
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="mb-2 flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.4em] text-accent-bright">
            <span className="inline-block h-px w-10 bg-accent" />
            FAQ
            <span className="inline-block h-px w-10 bg-accent" />
          </p>
          <h2 className="font-display text-center text-4xl font-extrabold tracking-[-0.02em]">
            Before you ask
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="faq card group transition-colors open:border-accent/40 hover:border-white/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                  <span className="font-display text-base font-semibold">
                    {f.q}
                  </span>
                  <span className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-accent-bright transition-colors group-open:border-accent/50 group-open:bg-accent-dim">
                    +
                  </span>
                </summary>
                <div className="faq-body px-6 pb-6">
                  <p className="max-w-[52ch] text-sm leading-relaxed text-muted">{f.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
