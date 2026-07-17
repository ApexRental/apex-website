import Link from "next/link";
import { prisma } from "@/lib/db";
import NewBookingForm from "@/components/admin/NewBookingForm";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const cars = await prisma.car.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, make: true, model: true, year: true, dailyRate: true },
  });

  const options = cars.map((c) => ({
    id: c.id,
    label: `${c.make} ${c.model} ${c.year}`,
    dailyRate: c.dailyRate,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/bookings"
          className="text-xs text-muted hover:text-fg"
        >
          ← Back to bookings
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">New booking</h1>
        <p className="mt-1 text-sm text-muted">
          Log a booking taken over the phone or in person.
        </p>
      </div>

      {options.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-5 py-10 text-center text-sm text-muted">
          Add a vehicle to the fleet first.
        </p>
      ) : (
        <NewBookingForm cars={options} />
      )}
    </div>
  );
}
