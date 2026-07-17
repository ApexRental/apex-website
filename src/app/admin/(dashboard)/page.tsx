import Link from "next/link";
import { prisma } from "@/lib/db";
import { money, dateShort } from "@/lib/format";
import StatTile from "@/components/admin/StatTile";
import StatusBadge from "@/components/admin/StatusBadge";
import BookingsChart, { DayPoint } from "@/components/admin/BookingsChart";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES = ["CONFIRMED", "ACTIVE", "COMPLETED"];

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  const [
    newCount,
    monthCount,
    revenueAgg,
    upcoming,
    recentBookings,
    topCarsRaw,
    cars,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "NEW" } }),
    prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: monthStart } },
    }),
    prisma.booking.count({
      where: {
        status: { in: ["NEW", "CONFIRMED"] },
        startDate: { gte: now, lte: weekAhead },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { car: true },
    }),
    prisma.booking.groupBy({
      by: ["carId"],
      _count: { carId: true },
      orderBy: { _count: { carId: "desc" } },
      take: 5,
    }),
    prisma.car.findMany(),
  ]);

  const carNames = new Map(cars.map((c) => [c.id, `${c.make} ${c.model}`]));
  const topCars = topCarsRaw.map((t) => ({
    name: carNames.get(t.carId) ?? "Unknown",
    count: t._count.carId,
  }));
  const topMax = Math.max(1, ...topCars.map((t) => t.count));

  // bookings per day, last 30 days
  const last30 = recentBookings.filter((b) => b.createdAt >= thirtyDaysAgo);
  const points: DayPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: last30.filter(
        (b) => b.createdAt.toISOString().slice(0, 10) === key
      ).length,
    });
  }

  const latest = recentBookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="New requests"
          value={String(newCount)}
          hint="waiting for confirmation"
        />
        <StatTile
          label="Bookings this month"
          value={String(monthCount)}
          hint={`since ${dateShort(monthStart)}`}
        />
        <StatTile
          label="Revenue this month"
          value={money(revenueAgg._sum.totalPrice ?? 0)}
          hint="confirmed, active & completed"
        />
        <StatTile
          label="Pickups next 7 days"
          value={String(upcoming)}
          hint="new & confirmed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold">Booking requests — last 30 days</h2>
          <div className="mt-5">
            <BookingsChart points={points} />
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold">Most requested cars</h2>
          {topCars.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No bookings yet.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {topCars.map((t) => (
                <li key={t.name}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span>{t.name}</span>
                    <span className="tabular-nums text-muted">{t.count}</span>
                  </div>
                  <div className="h-3 w-full">
                    <div
                      className="h-3 rounded-r-[4px] bg-accent"
                      style={{ width: `${(t.count / topMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold">Latest requests</h2>
          <Link href="/admin/bookings" className="text-xs text-accent-bright hover:underline">
            All bookings →
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">
            No booking requests yet. They&apos;ll show up here as soon as someone
            submits the form on the site.
          </p>
        ) : (
          <ul className="divide-y divide-line/60">
            {latest.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {b.fullName}
                    <span className="ml-2 text-muted">
                      {b.car.make} {b.car.model}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {dateShort(b.startDate)} → {dateShort(b.endDate)} · {money(b.totalPrice)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
