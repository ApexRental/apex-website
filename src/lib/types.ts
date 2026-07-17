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
