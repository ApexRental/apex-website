export type CarDTO = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  seats: number;
  transmission: string;
  fuel: string;
  dailyRate: number;
  deposit: number;
  imageUrl: string | null;
  images: string[];
  features: string[];
  overbooked: boolean;
  /** Custom per-day prices ("YYYY-MM-DD" -> USD) for the next 365 days. */
  rates: Record<string, number>;
};

export type PublicSettings = {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  serviceArea: string;
  depositNote: string;
  minRentalDays: number;
};
