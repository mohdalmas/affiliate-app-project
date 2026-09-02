import { Star } from "lucide-react";

// Five outline stars with a second, brand-colored row laid on top and
// clipped to `(rating / 5) * 100%` width — the standard partial-star-fill
// trick, so a 3.7 renders as a genuinely ~70%-filled 4th star instead of
// rounding to whole stars.
export function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number | null;
  size?: "sm" | "md";
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const starClass = size === "md" ? "size-4" : "size-3.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative inline-flex shrink-0">
        <div className="flex gap-0.5 text-muted">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`${starClass} fill-current`} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-primary"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`${starClass} fill-current shrink-0`} />
          ))}
        </div>
      </div>
      {reviewCount != null && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
