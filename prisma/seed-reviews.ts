import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const reviews = [
  {
    name: "Marcus D.",
    vehicle: "Hyundai Santa Fe",
    rating: 5,
    text: "Needed a car same-day for a family trip upstate. Called at 10am, had the Santa Fe by noon. Clean, full tank, third row folded flat for the bags. This is how it should work everywhere.",
    sortOrder: 1,
  },
  {
    name: "Alina K.",
    vehicle: "BMW X5",
    rating: 5,
    text: "Took the X5 for a wedding weekend in Jersey. The car looked freshly detailed and the deposit came back in four days like they promised. Will rent again for sure.",
    sortOrder: 2,
  },
  {
    name: "James R.",
    vehicle: "Honda Accord Hybrid",
    rating: 5,
    text: "Rented the Accord Hybrid for a week of client meetings. Barely touched the gas the whole time and it drove great. Booking took two minutes over the phone.",
    sortOrder: 3,
  },
  {
    name: "Priya S.",
    vehicle: "Hyundai Tucson",
    rating: 5,
    text: "My flight into JFK got delayed by three hours and they just moved the pickup without a fee. The Tucson handled a snowy weekend in the Catskills without a hiccup.",
    sortOrder: 4,
  },
  {
    name: "Dmitry V.",
    vehicle: "Jeep Grand Cherokee",
    rating: 5,
    text: "Grabbed the Grand Cherokee for a ski trip to the Poconos. 4x4 was rock solid in the snow and the guys were flexible when I brought it back a day late. Fair people.",
    sortOrder: 5,
  },
  {
    name: "Sophia L.",
    vehicle: "Hyundai Sonata",
    rating: 4,
    text: "Simple, cheap, reliable — exactly what I needed while my car was in the shop. The Sonata was spotless. Only wish they had a pickup point in Queens, but delivery solved it.",
    sortOrder: 6,
  },
];

async function main() {
  await prisma.review.deleteMany();
  for (const r of reviews) {
    await prisma.review.create({ data: r });
  }
  console.log(`Reset reviews: ${reviews.length} inserted`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
