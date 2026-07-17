import { prisma } from "@/lib/db";
import ReviewManager, { ReviewItem } from "@/components/admin/ReviewManager";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items: ReviewItem[] = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    vehicle: r.vehicle,
    rating: r.rating,
    text: r.text,
    isVisible: r.isVisible,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Reviews</h1>
      <ReviewManager reviews={items} />
    </div>
  );
}
