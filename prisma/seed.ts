import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cars = [
  {
    make: "Hyundai", model: "Sonata", year: 2021, category: "SEDAN",
    seats: 5, dailyRate: 65, features: "Apple CarPlay,Backup Camera,Bluetooth",
    imageUrl: "/images/fleet/sonata.jpg", sortOrder: 1,
  },
  {
    make: "Honda", model: "Accord Hybrid", year: 2023, category: "SEDAN",
    seats: 5, fuel: "Hybrid", dailyRate: 75,
    features: "Hybrid,Adaptive Cruise,Wireless CarPlay",
    imageUrl: "/images/fleet/accord.jpg", sortOrder: 2,
  },
  {
    make: "Hyundai", model: "Tucson", year: 2022, category: "SUV",
    seats: 5, dailyRate: 80, features: "AWD,Backup Camera,Apple CarPlay",
    imageUrl: "/images/fleet/tucson.jpg", sortOrder: 3,
  },
  {
    make: "Hyundai", model: "Santa Fe", year: 2024, category: "SUV",
    seats: 7, dailyRate: 95, features: "3 Rows,AWD,Apple CarPlay",
    imageUrl: "/images/fleet/santafe.jpg", sortOrder: 4,
  },
  {
    make: "Jeep", model: "Grand Cherokee", year: 2022, category: "SUV",
    seats: 5, dailyRate: 110, features: "4x4,Leather,Backup Camera",
    imageUrl: "/images/fleet/grand-cherokee.jpg", sortOrder: 5,
  },
  {
    make: "BMW", model: "X5", year: 2021, category: "PREMIUM",
    seats: 5, dailyRate: 175, deposit: 1000,
    features: "Leather,AWD,Panoramic Roof",
    imageUrl: "/images/fleet/x5.jpg", sortOrder: 6,
  },
  {
    make: "Genesis", model: "GV70", year: 2026, category: "PREMIUM",
    seats: 5, dailyRate: 185, deposit: 1000,
    features: "AWD,Nappa Leather,360 Camera",
    imageUrl: "/images/fleet/gv70.jpg", sortOrder: 7,
  },
];

const terms = [
  {
    title: "Damage Responsibility",
    body: "Renter is fully responsible for all damages to the vehicle during the rental period, regardless of fault.",
  },
  {
    title: "No Insurance / CDW",
    body: "No collision damage waiver or insurance coverage is included. Renter must provide their own coverage.",
  },
  {
    title: "Late Return",
    body: "A late fee will be charged for each hour or day the vehicle is returned past the agreed end date/time.",
  },
  {
    title: "Cleaning Fee",
    body: "Excessive dirt, stains, or odors will result in a cleaning fee of up to $250.",
  },
  {
    title: "No Smoking",
    body: "Smoking in the vehicle is strictly prohibited. A $250 smoke remediation fee applies if violated.",
  },
  {
    title: "Fuel Policy",
    body: "The vehicle must be returned with the same fuel level as at the time of pickup (full-to-full or half-to-half). If the vehicle is returned with less fuel than provided, a refueling fee plus a service charge will be applied.",
  },
  {
    title: "Geographic Restriction",
    body: "Vehicles may only be driven within New York (NY), New Jersey (NJ), Connecticut (CT), and Pennsylvania (PA). Traveling outside these states requires prior written authorization.",
  },
  {
    title: "Tolls & Traffic Violations",
    body: "Renter is solely responsible for all tolls, parking tickets, and traffic violations incurred during the rental. If the renter uses the vehicle's EZ Pass, tolls will be charged via Toll by Plate with a processing fee of $9.95 per transaction.",
  },
];

const settings: Record<string, string> = {
  companyName: "Apex Rentals",
  tagline: "Drive Your Journey",
  phone: "+1-646-234-4474",
  email: "apexfleetrentalsss@gmail.com",
  serviceArea: "New York City · New Jersey · Connecticut · Pennsylvania",
  depositNote:
    "Refundable security deposit of $200–$500 (up to $1,000 on luxury cars), released after inspection on return.",
  hours: "Open 7 days · 8am–midnight",
  monthlyFrom: "1,400",
  minRentalDays: "1",
  terms: JSON.stringify(terms),
};

async function main() {
  const carCount = await prisma.car.count();
  if (carCount === 0) {
    for (const car of cars) {
      await prisma.car.create({ data: car });
    }
    console.log(`Seeded ${cars.length} cars`);
  } else {
    console.log("Cars already present, skipping");
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Seeded settings");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
