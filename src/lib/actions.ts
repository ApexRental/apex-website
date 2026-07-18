"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "./db";
import { rateLimit, clientIp } from "./rate-limit";
import {
  checkPassword,
  setPassword,
  setSessionCookie,
  clearSessionCookie,
  isAuthenticated,
} from "./auth";
import { setSetting } from "./settings";
import { BOOKING_STATUSES, daysBetween, computeQuote } from "./format";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/terms");
}

// ---------- auth ----------

export type ActionResult = { ok: boolean; error?: string; message?: string };

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // rate limit: max 8 attempts per 10 min per IP (brute-force deterrent)
  const h = await headers();
  const ip = clientIp(h);
  if (!rateLimit(`login:${ip}`, 8, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes." };
  }
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) {
    return { ok: false, error: "Wrong password" };
  }
  await setSessionCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!(await checkPassword(current))) {
    return { ok: false, error: "Current password is wrong" };
  }
  if (next.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters" };
  }
  await setPassword(next);
  return { ok: true, message: "Password updated" };
}

// ---------- bookings ----------

export async function updateBookingStatusAction(id: string, status: string) {
  await requireAuth();
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) {
    throw new Error("Bad status");
  }
  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}

export async function saveBookingNotesAction(id: string, notes: string) {
  await requireAuth();
  await prisma.booking.update({
    where: { id },
    data: { adminNotes: notes.slice(0, 2000) },
  });
  revalidatePath("/admin/bookings");
}

/** Manually add a booking (e.g. one taken over the phone). No emails are sent. */
export async function createBookingAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const carId = String(formData.get("carId") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const licenseNumber = String(formData.get("licenseNumber") ?? "").trim();
  const startStr = String(formData.get("startDate") ?? "");
  const endStr = String(formData.get("endDate") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const statusInput = String(formData.get("status") ?? "CONFIRMED");
  const status = (BOOKING_STATUSES as readonly string[]).includes(statusInput)
    ? statusInput
    : "CONFIRMED";

  if (!carId) return { ok: false, error: "Pick a vehicle." };
  if (fullName.length < 2) return { ok: false, error: "Enter the customer name." };
  if (phone.length < 5) return { ok: false, error: "Enter a contact phone number." };
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, error: "That email address looks invalid." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startStr) || !/^\d{4}-\d{2}-\d{2}$/.test(endStr))
    return { ok: false, error: "Pick both a pickup and a return date." };

  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return { ok: false, error: "Those dates aren't valid." };
  if (end <= start)
    return { ok: false, error: "The return date must be after the pickup date." };

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) return { ok: false, error: "That vehicle no longer exists." };

  const days = daysBetween(start, end);
  const totalPrice = computeQuote(car.dailyRate, days).total;

  await prisma.booking.create({
    data: {
      carId: car.id,
      fullName,
      phone,
      email: email || "—",
      licenseNumber: licenseNumber || null,
      startDate: start,
      endDate: end,
      days,
      dailyRate: car.dailyRate,
      totalPrice,
      status,
      message: message || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}

// ---------- fleet ----------

const CAR_CATEGORIES = ["ECONOMY", "SEDAN", "SUV", "ELECTRIC", "PREMIUM"];

export async function saveCarAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = Number(formData.get("year"));
  const category = String(formData.get("category") ?? "SEDAN");
  const seats = Number(formData.get("seats") ?? 5);
  const transmission = String(formData.get("transmission") ?? "Automatic");
  const fuel = String(formData.get("fuel") ?? "Gasoline");
  const dailyRate = Number(formData.get("dailyRate"));
  const deposit = Number(formData.get("deposit") ?? 500);
  const features = String(formData.get("features") ?? "").trim();
  const images = String(formData.get("images") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");
  const isAvailable = formData.get("isAvailable") === "on";
  const imageUrlField = String(formData.get("imageUrl") ?? "").trim();

  if (!make || !model) return { ok: false, error: "Make and model are required" };
  if (!Number.isFinite(year) || year < 1990 || year > 2100)
    return { ok: false, error: "Enter a valid year" };
  if (!Number.isFinite(dailyRate) || dailyRate <= 0)
    return { ok: false, error: "Enter a valid daily rate" };
  if (!CAR_CATEGORIES.includes(category))
    return { ok: false, error: "Bad category" };

  let imageUrl: string | null = imageUrlField || null;

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > 8 * 1024 * 1024)
      return { ok: false, error: "Image is too large (max 8 MB)" };
    const ext = path.extname(file.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext))
      return { ok: false, error: "Image must be JPG, PNG, WEBP or AVIF" };
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
    imageUrl = `/uploads/${filename}`;
  }

  const data = {
    make,
    model,
    year,
    category,
    seats: Number.isFinite(seats) && seats > 0 ? seats : 5,
    transmission,
    fuel,
    dailyRate,
    deposit: Number.isFinite(deposit) && deposit >= 0 ? deposit : 500,
    features,
    images,
    isAvailable,
    ...(imageUrl !== null || !id ? { imageUrl } : {}),
  };

  if (id) {
    await prisma.car.update({ where: { id }, data });
  } else {
    await prisma.car.create({ data });
  }

  revalidatePublic();
  revalidatePath("/admin/fleet");
  redirect("/admin/fleet");
}

export async function deleteCarAction(id: string): Promise<ActionResult> {
  await requireAuth();
  const bookingCount = await prisma.booking.count({ where: { carId: id } });
  if (bookingCount > 0) {
    await prisma.car.update({ where: { id }, data: { isAvailable: false } });
    revalidatePublic();
    revalidatePath("/admin/fleet");
    return {
      ok: true,
      message:
        "This car has bookings, so it was hidden from the site instead of deleted.",
    };
  }
  await prisma.car.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/fleet");
  return { ok: true, message: "Car deleted" };
}

export async function toggleCarAvailabilityAction(id: string) {
  await requireAuth();
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) return;
  await prisma.car.update({
    where: { id },
    data: { isAvailable: !car.isAvailable },
  });
  revalidatePublic();
  revalidatePath("/admin/fleet");
}

// ---------- reviews ----------

export async function saveReviewAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const vehicle = String(formData.get("vehicle") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 5);
  const text = String(formData.get("text") ?? "").trim();

  if (!name || !text) return { ok: false, error: "Name and text are required" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { ok: false, error: "Rating must be 1–5" };

  const data = {
    name: name.slice(0, 80),
    vehicle: vehicle ? vehicle.slice(0, 80) : null,
    rating,
    text: text.slice(0, 1000),
  };

  if (id) {
    await prisma.review.update({ where: { id }, data });
  } else {
    await prisma.review.create({ data });
  }
  revalidatePublic();
  revalidatePath("/admin/reviews");
  return { ok: true, message: id ? "Review updated" : "Review added" };
}

export async function deleteReviewAction(id: string) {
  await requireAuth();
  await prisma.review.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/reviews");
}

export async function toggleReviewVisibilityAction(id: string) {
  await requireAuth();
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  await prisma.review.update({
    where: { id },
    data: { isVisible: !review.isVisible },
  });
  revalidatePublic();
  revalidatePath("/admin/reviews");
}

// ---------- settings ----------

export async function saveContactSettingsAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();
  const fields = [
    "companyName",
    "tagline",
    "phone",
    "email",
    "serviceArea",
    "depositNote",
    "hours",
    "monthlyFrom",
  ] as const;
  for (const f of fields) {
    await setSetting(f, String(formData.get(f) ?? "").trim());
  }
  revalidatePublic();
  return { ok: true, message: "Contact info saved" };
}

export async function saveTermsAction(
  termsJson: string
): Promise<ActionResult> {
  await requireAuth();
  let parsed: unknown;
  try {
    parsed = JSON.parse(termsJson);
  } catch {
    return { ok: false, error: "Invalid terms payload" };
  }
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (t) =>
        t &&
        typeof t.title === "string" &&
        typeof t.body === "string" &&
        t.title.trim() &&
        t.body.trim()
    )
  ) {
    return { ok: false, error: "Each term needs a title and text" };
  }
  const clean = (parsed as { title: string; body: string }[]).map((t) => ({
    title: t.title.trim().slice(0, 200),
    body: t.body.trim().slice(0, 4000),
  }));
  await setSetting("terms", JSON.stringify(clean));
  revalidatePublic();
  return { ok: true, message: "Terms saved" };
}
