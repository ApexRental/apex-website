/** Central site/business constants used for SEO, footer, structured data. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://apexrentalfleet.com";

export const BUSINESS = {
  name: "Apex Rentals",
  legalName: "Apex Rent A Car",
  phone: "+1-646-234-4474",
  email: "apexfleetrentalsss@gmail.com",
  tagline: "Drive Your Journey",
  areasServed: ["New York", "New Jersey", "Connecticut", "Pennsylvania"],
  hours: "Mo-Su 08:00-23:59",
  priceRange: "$$",
} as const;
