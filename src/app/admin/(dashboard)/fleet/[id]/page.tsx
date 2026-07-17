import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CarForm from "@/components/admin/CarForm";

export const dynamic = "force-dynamic";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">
        Edit — {car.make} {car.model} {car.year}
      </h1>
      <CarForm
        car={{
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          category: car.category,
          seats: car.seats,
          transmission: car.transmission,
          fuel: car.fuel,
          dailyRate: car.dailyRate,
          deposit: car.deposit,
          features: car.features,
          imageUrl: car.imageUrl,
          images: car.images,
          isAvailable: car.isAvailable,
        }}
      />
    </div>
  );
}
