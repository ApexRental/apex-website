import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { nightlyRates, quoteFromNights, groupNights } from "@/lib/pricing";
import { getRateMap } from "@/lib/rates";
import { formatTime, isValidTime, DEFAULT_TIME, todayNY } from "@/lib/booking-options";
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
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  pickupLocation: z.string().max(80).optional(),
  returnLocation: z.string().max(80).optional(),
  deliveryAddress: z.string().max(300).optional(),
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

  const pickupTime = data.pickupTime && isValidTime(data.pickupTime) ? data.pickupTime : DEFAULT_TIME;
  const returnTime = data.returnTime && isValidTime(data.returnTime) ? data.returnTime : DEFAULT_TIME;

  // Validate the date range by string comparison (timezone-robust), then store
  // the timed values as UTC wall-clock (trailing Z) so the hour never drifts.
  const todayStr = todayNY();
  if (data.startDate < todayStr) {
    return NextResponse.json(
      { error: "Pickup date can't be in the past." },
      { status: 400 }
    );
  }
  if (data.endDate <= data.startDate) {
    return NextResponse.json(
      { error: "Return date must be after the pickup date." },
      { status: 400 }
    );
  }

  const start = new Date(`${data.startDate}T${pickupTime}:00Z`);
  const end = new Date(`${data.endDate}T${returnTime}:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid dates." }, { status: 400 });
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

  // price every billable day from the rate calendar (custom price or base)
  const rates = await getRateMap(car.id, data.startDate, data.endDate);
  const nights = nightlyRates(car.dailyRate, rates, data.startDate, data.endDate);
  const quote = quoteFromNights(nights);

  const pickupLocation = data.pickupLocation?.trim() || null;
  const returnLocation = data.returnLocation?.trim() || null;
  const deliveryAddress = data.deliveryAddress?.trim() || null;

  const booking = await prisma.booking.create({
    data: {
      carId: car.id,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      licenseNumber: data.licenseNumber ?? null,
      startDate: start,
      endDate: end,
      days: quote.days,
      dailyRate: quote.dailyRate,
      subtotal: quote.subtotal,
      rateBreakdown: nights,
      totalPrice: quote.total,
      pickupLocation,
      returnLocation,
      deliveryAddress,
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
    startDate: data.startDate,
    endDate: data.endDate,
    pickupTime: formatTime(pickupTime),
    returnTime: formatTime(returnTime),
    pickupLocation,
    returnLocation,
    deliveryAddress,
    days: quote.days,
    quote,
    groups: groupNights(nights),
    message: booking.message,
  }).catch((e) => console.error("[email] notification error:", e));

  return NextResponse.json({ ok: true, bookingId: booking.id }, { status: 201 });
}
