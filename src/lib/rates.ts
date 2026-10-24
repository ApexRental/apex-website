/**
 * Read custom per-day prices from the database as RateMaps (date -> price).
 * Server-side only (uses Prisma). `from` and `to` are inclusive "YYYY-MM-DD".
 */
import { prisma } from "./db";
import type { RateMap } from "./pricing";

const dayStart = (date: string) => new Date(`${date}T00:00:00Z`);
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Custom prices for one car between two dates. */
export async function getRateMap(carId: string, from: string, to: string): Promise<RateMap> {
  const rows = await prisma.carRate.findMany({
    where: { carId, date: { gte: dayStart(from), lte: dayStart(to) } },
    select: { date: true, price: true },
  });
  const map: RateMap = {};
  for (const r of rows) map[dayKey(r.date)] = r.price;
  return map;
}

/** Custom prices for several cars between two dates, keyed by car id. */
export async function getRateMaps(
  carIds: string[],
  from: string,
  to: string
): Promise<Record<string, RateMap>> {
  const maps: Record<string, RateMap> = Object.fromEntries(carIds.map((id) => [id, {}]));
  if (carIds.length === 0) return maps;
  const rows = await prisma.carRate.findMany({
    where: { carId: { in: carIds }, date: { gte: dayStart(from), lte: dayStart(to) } },
    select: { carId: true, date: true, price: true },
  });
  for (const r of rows) maps[r.carId][dayKey(r.date)] = r.price;
  return maps;
}
