import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Replaces the seeded/sample fleet with Apex's actual vehicles.
 * Wipes existing bookings + cars first (dev reset), then inserts the real cars.
 */
/** Build a comma-separated gallery ("slug-1.jpg,slug-2.jpg,..."). First = cover. */
function gallery(slug: string, count: number) {
  return Array.from({ length: count }, (_, i) => `/images/fleet/${slug}-${i + 1}.jpg`).join(",");
}

const cars = [
  {
    make: "Hyundai", model: "Sonata", year: 2021, category: "SEDAN",
    seats: 5, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 65, deposit: 500,
    features: "Apple CarPlay,Backup Camera,Bluetooth",
    imageUrl: "/images/fleet/sonata-1.jpg", images: gallery("sonata", 4), sortOrder: 1,
  },
  {
    make: "Honda", model: "Accord Hybrid", year: 2023, category: "SEDAN",
    seats: 5, transmission: "Automatic", fuel: "Hybrid",
    dailyRate: 75, deposit: 500,
    features: "Hybrid,Adaptive Cruise,Wireless CarPlay",
    imageUrl: "/images/fleet/accord-1.jpg", images: gallery("accord", 5), sortOrder: 2,
  },
  {
    make: "Hyundai", model: "Tucson", year: 2022, category: "SUV",
    seats: 5, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 80, deposit: 500,
    features: "AWD,Backup Camera,Apple CarPlay",
    imageUrl: "/images/fleet/tucson-1.jpg", images: gallery("tucson", 4), sortOrder: 3,
  },
  {
    make: "Hyundai", model: "Santa Fe", year: 2024, category: "SUV",
    seats: 7, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 95, deposit: 500,
    features: "3 Rows,AWD,Apple CarPlay",
    imageUrl: "/images/fleet/santafe-1.jpg", images: gallery("santafe", 5), sortOrder: 4,
  },
  {
    make: "Hyundai", model: "Palisade", year: 2024, category: "SUV",
    seats: 8, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 120, deposit: 500,
    features: "3 Rows,AWD,Leather",
    imageUrl: "/images/fleet/palisade-1.jpg", images: gallery("palisade", 5), sortOrder: 5,
  },
  {
    make: "Jeep", model: "Grand Cherokee", year: 2022, category: "SUV",
    seats: 5, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 110, deposit: 500,
    features: "4x4,Leather,Backup Camera",
    imageUrl: "/images/fleet/grand-cherokee-1.jpg", images: gallery("grand-cherokee", 5), sortOrder: 6,
  },
  {
    make: "BMW", model: "X5", year: 2021, category: "PREMIUM",
    seats: 5, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 175, deposit: 1000,
    features: "Leather,AWD,Panoramic Roof",
    imageUrl: "/images/fleet/x5-1.jpg", images: gallery("x5", 6), sortOrder: 7,
  },
  {
    make: "Genesis", model: "GV70", year: 2026, category: "PREMIUM",
    seats: 5, transmission: "Automatic", fuel: "Gasoline",
    dailyRate: 185, deposit: 1000,
    features: "AWD,Nappa Leather,360 Camera",
    imageUrl: "/images/fleet/gv70-1.jpg", images: gallery("gv70", 4), sortOrder: 8,
  },
];

async function main() {
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  for (const car of cars) {
    await prisma.car.create({ data: car });
  }
  console.log(`Reset fleet: ${cars.length} real cars inserted`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
