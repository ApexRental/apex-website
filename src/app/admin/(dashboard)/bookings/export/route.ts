import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { car: true },
  });

  const header = [
    "Created", "Status", "Name", "Phone", "Email", "License",
    "Car", "Pickup", "Pickup time", "Pickup location", "Return", "Return time",
    "Return location", "Delivery address", "Days", "Daily rate", "Total",
    "Message", "Admin notes",
  ];

  const hhmm = (d: Date) => d.toISOString().slice(11, 16); // UTC HH:MM

  const rows = bookings.map((b) =>
    [
      b.createdAt.toISOString().slice(0, 10),
      b.status,
      b.fullName,
      b.phone,
      b.email,
      b.licenseNumber ?? "",
      `${b.car.make} ${b.car.model} ${b.car.year}`,
      b.startDate.toISOString().slice(0, 10),
      hhmm(b.startDate),
      b.pickupLocation ?? "",
      b.endDate.toISOString().slice(0, 10),
      hhmm(b.endDate),
      b.returnLocation ?? "",
      b.deliveryAddress ?? "",
      b.days,
      b.dailyRate,
      b.totalPrice,
      b.message ?? "",
      b.adminNotes ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="apex-bookings-${date}.csv"`,
    },
  });
}
