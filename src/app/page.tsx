import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CarDTO } from "@/lib/types";
import Navbar from "@/components/public/Navbar";
import { FleetFilterProvider } from "@/components/public/FleetFilterContext";
import HeroCarousel from "@/components/public/HeroCarousel";
import SearchBar from "@/components/public/SearchBar";
import BrandStrip from "@/components/public/BrandStrip";
import FleetSection from "@/components/public/FleetSection";
import HowItWorks from "@/components/public/HowItWorks";
import PromoStrip from "@/components/public/PromoStrip";
import AboutSection from "@/components/public/AboutSection";
import ReviewsSection, { ReviewDTO } from "@/components/public/ReviewsSection";
import LongTermSection from "@/components/public/LongTermSection";
import TermsPreview from "@/components/public/TermsPreview";
import FaqSection from "@/components/public/FaqSection";
import ServiceAreaSection from "@/components/public/ServiceAreaSection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import MobileCta from "@/components/public/MobileCta";
import JsonLd from "@/components/public/JsonLd";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, cars, reviews] = await Promise.all([
    getSettings(),
    prisma.car.findMany({
      where: { isAvailable: true },
      orderBy: [{ sortOrder: "asc" }, { dailyRate: "asc" }],
    }),
    prisma.review.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const carDtos: CarDTO[] = cars.map((c) => ({
    id: c.id,
    make: c.make,
    model: c.model,
    year: c.year,
    category: c.category,
    seats: c.seats,
    transmission: c.transmission,
    fuel: c.fuel,
    dailyRate: c.dailyRate,
    deposit: c.deposit,
    imageUrl: c.imageUrl,
    images: c.images ? c.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
    features: c.features ? c.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
  }));

  const reviewDtos: ReviewDTO[] = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    vehicle: r.vehicle,
    rating: r.rating,
    text: r.text,
  }));

  const avgRating =
    reviewDtos.length > 0
      ? reviewDtos.reduce((sum, r) => sum + r.rating, 0) / reviewDtos.length
      : 5;

  return (
    <>
      <JsonLd />
      <Navbar phone={settings.phone} />
      <main className="flex-1">
        <FleetFilterProvider>
          <HeroCarousel rating={avgRating} />
          <SearchBar />
          <PromoStrip />
          <BrandStrip />
          <FleetSection cars={carDtos} />
        </FleetFilterProvider>
        <HowItWorks />
        <AboutSection avgRating={avgRating} />
        <ReviewsSection reviews={reviewDtos} avgRating={avgRating} />
        <LongTermSection
          phone={settings.phone}
          email={settings.email}
          monthlyFrom={settings.monthlyFrom}
        />
        <TermsPreview terms={settings.terms} depositNote={settings.depositNote} />
        <FaqSection />
        <ServiceAreaSection />
        <ContactSection
          phone={settings.phone}
          email={settings.email}
          serviceArea={settings.serviceArea}
          hours={settings.hours}
        />
      </main>
      <Footer
        companyName={settings.companyName}
        tagline={settings.tagline}
        phone={settings.phone}
        email={settings.email}
        hours={settings.hours}
      />
      <MobileCta phone={settings.phone} />
    </>
  );
}
