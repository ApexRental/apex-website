import { SITE_URL, BUSINESS } from "@/lib/site";

/** LocalBusiness / AutoRental structured data for local SEO. */
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    areaServed: BUSINESS.areasServed.map((name) => ({
      "@type": "State",
      name,
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday",
      ],
      opens: "08:00",
      closes: "23:59",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
