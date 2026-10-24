"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "./db";
import { isAuthenticated } from "./auth";
import { planRateChange } from "./pricing";
import { todayNY } from "./booking-options";
import { money } from "./format";
import type { ActionResult } from "./actions";

const rangeSchema = z.object({
  carId: z.string().min(1),
  from: z.string(),
  to: z.string(),
  weekdays: z.array(z.number().int()).max(7),
});
const applySchema = rangeSchema.extend({ price: z.number() });

const dayStart = (date: string) => new Date(`${date}T00:00:00Z`);
const dayCount = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

/** Auth + car existence; returns an error result, or null when OK to proceed. */
async function guard(carId: string): Promise<ActionResult | null> {
  if (!(await isAuthenticated())) return { ok: false, error: "Please sign in again." };
  const car = await prisma.car.findUnique({ where: { id: carId }, select: { id: true } });
  if (!car) return { ok: false, error: "That vehicle no longer exists." };
  return null;
}

function revalidateRates() {
  revalidatePath("/admin/rates");
  revalidatePath("/");
}

/** Set a custom price on every matching day in the range (replacing old ones). */
export async function applyRatesAction(input: {
  carId: string;
  from: string;
  to: string;
  weekdays: number[];
  price: number;
}): Promise<ActionResult> {
  const parsed = applySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const { carId, from, to, weekdays, price } = parsed.data;

  const blocked = await guard(carId);
  if (blocked) return blocked;

  const plan = planRateChange({ from, to, weekdays, price }, todayNY());
  if ("error" in plan) return { ok: false, error: plan.error };
  const finalPrice = plan.price ?? price;

  const dates = plan.dates.map(dayStart);
  try {
    // skipDuplicates + updateMany: two overlapping saves (e.g. a double click)
    // can't hit the unique (carId, date) index — the last save wins instead
    await prisma.$transaction([
      prisma.carRate.deleteMany({ where: { carId, date: { in: dates } } }),
      prisma.carRate.createMany({
        data: dates.map((date) => ({ carId, date, price: finalPrice })),
        skipDuplicates: true,
      }),
      prisma.carRate.updateMany({ where: { carId, date: { in: dates } }, data: { price: finalPrice } }),
    ]);
  } catch (e) {
    console.error("[rates] apply failed:", e);
    return { ok: false, error: "Couldn't save the prices. Please try again." };
  }

  revalidateRates();
  return { ok: true, message: `Saved ${money(finalPrice)}/day for ${dayCount(plan.dates.length)}.` };
}

/** Remove custom prices on every matching day in the range (back to base rate). */
export async function clearRatesAction(input: {
  carId: string;
  from: string;
  to: string;
  weekdays: number[];
}): Promise<ActionResult> {
  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const { carId, from, to, weekdays } = parsed.data;

  const blocked = await guard(carId);
  if (blocked) return blocked;

  const plan = planRateChange({ from, to, weekdays }, todayNY());
  if ("error" in plan) return { ok: false, error: plan.error };

  try {
    await prisma.carRate.deleteMany({ where: { carId, date: { in: plan.dates.map(dayStart) } } });
  } catch (e) {
    console.error("[rates] reset failed:", e);
    return { ok: false, error: "Couldn't reset the prices. Please try again." };
  }

  revalidateRates();
  return { ok: true, message: `Reset ${dayCount(plan.dates.length)} to the base rate.` };
}
