import Link from "next/link";
import { prisma } from "@/lib/db";
import { BOOKING_STATUSES } from "@/lib/format";
import BookingRow, { BookingItem } from "@/components/admin/BookingRow";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter =
    status && (BOOKING_STATUSES as readonly string[]).includes(status)
      ? status
      : undefined;

  // fetch all bookings so we can flag date conflicts across the whole fleet,
  // then apply the display filter afterwards
  const all = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { car: true },
  });

  // a booking conflicts if another non-cancelled/-completed booking of the same
  // car overlaps its date range
  const blocking = (s: string) => s !== "CANCELLED" && s !== "COMPLETED";
  const conflictIds = new Set<string>();
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      if (
        a.carId === b.carId &&
        blocking(a.status) &&
        blocking(b.status) &&
        a.startDate <= b.endDate &&
        b.startDate <= a.endDate
      ) {
        conflictIds.add(a.id);
        conflictIds.add(b.id);
      }
    }
  }

  const countMap: Record<string, number> = {};
  for (const b of all) countMap[b.status] = (countMap[b.status] ?? 0) + 1;
  const total = all.length;

  const bookings = filter ? all.filter((b) => b.status === filter) : all;

  const items: BookingItem[] = bookings.map((b) => ({
    id: b.id,
    fullName: b.fullName,
    phone: b.phone,
    email: b.email,
    licenseNumber: b.licenseNumber,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    days: b.days,
    dailyRate: b.dailyRate,
    totalPrice: b.totalPrice,
    status: b.status,
    message: b.message,
    adminNotes: b.adminNotes,
    createdAt: b.createdAt.toISOString(),
    carName: `${b.car.make} ${b.car.model} ${b.car.year}`,
    conflict: conflictIds.has(b.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Bookings</h1>
        <div className="flex items-center gap-2">
          <a
            href="/admin/bookings/export"
            className="rounded border border-line px-3 py-1.5 text-xs font-medium text-muted hover:border-accent/50 hover:text-fg"
          >
            ↓ Export CSV
          </a>
          <Link
            href="/admin/bookings/new"
            className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-bright"
          >
            + New booking
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/admin/bookings" active={!filter} label={`All (${total})`} />
        {BOOKING_STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/bookings?status=${s}`}
            active={filter === s}
            label={`${s.charAt(0) + s.slice(1).toLowerCase()} (${countMap[s] ?? 0})`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-line bg-surface">
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No bookings{filter ? ` with status "${filter.toLowerCase()}"` : ""} yet.
          </p>
        ) : (
          <ul>
            {items.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent-dim text-accent-bright"
          : "border-line text-muted hover:border-accent/50 hover:text-fg"
      }`}
    >
      {label}
    </Link>
  );
}
