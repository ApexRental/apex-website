import Link from "next/link";
import { prisma } from "@/lib/db";
import { getRateMap } from "@/lib/rates";
import { todayNY } from "@/lib/booking-options";
import RateCalendar from "@/components/admin/RateCalendar";

export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Last calendar day of a "YYYY-MM" month, as "YYYY-MM-DD". */
function lastDayOf(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export default async function RatesPage({
  searchParams,
}: {
  searchParams: Promise<{ car?: string; month?: string }>;
}) {
  const { car: carParam, month: monthParam } = await searchParams;

  const cars = await prisma.car.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, make: true, model: true, year: true, dailyRate: true },
  });

  if (cars.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">Rates</h1>
        <p className="text-sm text-muted">
          Add a car in <Link href="/admin/fleet" className="text-accent-bright hover:underline">Fleet</Link> first.
        </p>
      </div>
    );
  }

  const today = todayNY();
  const selected = cars.find((c) => c.id === carParam) ?? cars[0];
  const month = monthParam && MONTH_RE.test(monthParam) ? monthParam : today.slice(0, 7);
  const rates = await getRateMap(selected.id, `${month}-01`, lastDayOf(month));
  const name = (c: (typeof cars)[number]) => `${c.make} ${c.model} ${c.year}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Rates</h1>
        <p className="mt-1 text-sm text-muted">
          Set a different daily price for specific days. Days without a custom
          price use the car&apos;s base rate.
        </p>
      </div>
      <RateCalendar
        key={selected.id}
        cars={cars.map((c) => ({ id: c.id, name: name(c) }))}
        car={{ id: selected.id, name: name(selected), dailyRate: selected.dailyRate }}
        month={month}
        rates={rates}
        today={today}
      />
    </div>
  );
}
