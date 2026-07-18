import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { daysBetween, dateShort, computeQuote } from "@/lib/format";
import { sendBookingNotifications } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const bookingSchema = z.object({
  carId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  email: z.string().email().max(160),
  licenseNumber: z.string().max(80).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  message: z.string().max(2000).optional(),
  company: z.string().max(200).optional(), // honeypot — must stay empty
});

export async function POST(request: Request) {
  // rate limit: max 5 booking requests per 10 min per IP
  const ip = clientIp(request.headers);
  if (!rateLimit(`booking:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form fields and try again." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // honeypot: real users never fill this hidden field. Pretend success so bots
  // don't retry, but don't create anything.
  if (data.company && data.company.trim()) {
    return NextResponse.json({ ok: true, bookingId: "skipped" }, { status: 200 });
  }

  const start = new Date(`${data.startDate}T00:00:00`);
  const end = new Date(`${data.endDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid dates." }, { status: 400 });
  }
  if (start < today) {
    return NextResponse.json(
      { error: "Pickup date can't be in the past." },
      { status: 400 }
    );
  }
  if (end <= start) {
    return NextResponse.json(
      { error: "Return date must be after the pickup date." },
      { status: 400 }
    );
  }

  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car || !car.isAvailable) {
    return NextResponse.json(
      { error: "This vehicle is no longer available." },
      { status: 404 }
    );
  }
  if (car.overbooked) {
    return NextResponse.json(
      { error: "This vehicle is fully booked right now. Please choose another or call us." },
      { status: 409 }
    );
  }

  const days = daysBetween(start, end);
  const totalPrice = computeQuote(car.dailyRate, days).total;

  const booking = await prisma.booking.create({
    data: {
      carId: car.id,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      licenseNumber: data.licenseNumber ?? null,
      startDate: start,
      endDate: end,
      days,
      dailyRate: car.dailyRate,
      totalPrice,
      message: data.message ?? null,
    },
  });

  // Fire-and-forget: a failed email must not fail the booking
  sendBookingNotifications({
    id: booking.id,
    fullName: booking.fullName,
    phone: booking.phone,
    email: booking.email,
    car: `${car.make} ${car.model} ${car.year}`,
    startDate: dateShort(start),
    endDate: dateShort(end),
    days,
    dailyRate: car.dailyRate,
    message: booking.message,
  }).catch((e) => console.error("[email] notification error:", e));

  return NextResponse.json({ ok: true, bookingId: booking.id }, { status: 201 });
}
