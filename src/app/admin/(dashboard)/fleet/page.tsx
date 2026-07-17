import Link from "next/link";
import { prisma } from "@/lib/db";
import FleetRow, { FleetItem } from "@/components/admin/FleetRow";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const cars = await prisma.car.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { bookings: true } } },
  });

  const items: FleetItem[] = cars.map((c) => ({
    id: c.id,
    name: `${c.make} ${c.model} ${c.year}`,
    category: c.category,
    dailyRate: c.dailyRate,
    deposit: c.deposit,
    isAvailable: c.isAvailable,
    bookingCount: c._count.bookings,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Fleet</h1>
        <Link
          href="/admin/fleet/new"
          className="cta-cut bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-bright"
        >
          + Add car
        </Link>
      </div>

      <div className="rounded-lg border border-line bg-surface">
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No cars yet — add your first vehicle.
          </p>
        ) : (
          <ul>
            {items.map((c) => (
              <FleetRow key={c.id} car={c} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
