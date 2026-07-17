import { prisma } from "./db";

export type TermItem = { title: string; body: string };

export type SiteSettings = {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  serviceArea: string;
  depositNote: string;
  hours: string;
  monthlyFrom: string;
  minRentalDays: number;
  terms: TermItem[];
};

const DEFAULTS: SiteSettings = {
  companyName: "Apex Rentals",
  tagline: "Drive Your Journey",
  phone: "",
  email: "",
  serviceArea: "",
  depositNote: "",
  hours: "Open 7 days · 8am–midnight",
  monthlyFrom: "1,400",
  minRentalDays: 1,
  terms: [],
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  let terms: TermItem[] = [];
  try {
    terms = map.terms ? JSON.parse(map.terms) : [];
  } catch {
    terms = [];
  }
  return {
    companyName: map.companyName ?? DEFAULTS.companyName,
    tagline: map.tagline ?? DEFAULTS.tagline,
    phone: map.phone ?? DEFAULTS.phone,
    email: map.email ?? DEFAULTS.email,
    serviceArea: map.serviceArea ?? DEFAULTS.serviceArea,
    depositNote: map.depositNote ?? DEFAULTS.depositNote,
    hours: map.hours ?? DEFAULTS.hours,
    monthlyFrom: map.monthlyFrom ?? DEFAULTS.monthlyFrom,
    minRentalDays: Number(map.minRentalDays ?? 1) || 1,
    terms,
  };
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
