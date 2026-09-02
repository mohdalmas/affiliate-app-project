import { Children } from "react";

// One named shelf — a heading (+ optional subtitle) over a single
// horizontally-scrollable row of deal cards (left/right, not a wrapping
// grid) — used by both the admin-curated home sections and the "More in
// category" shelf on a product page.
export function DealSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | null;
  children: React.ReactNode;
}) {
  const items = Children.toArray(children);

  return (
    <section className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold">{title}</h2>
        {subtitle && (
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {/* overscroll-x-contain stops the swipe from also dragging the whole
          page (a common "feels broken" symptom on mobile Safari/Chrome for
          Android when a horizontal scroller sits inside a vertically
          scrolling page); [-webkit-overflow-scrolling:touch] gives it
          native momentum on older iOS Safari, which doesn't do that by
          default the way modern versions do. */}
      <div
        className="flex gap-4 sm:gap-5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 [-webkit-overflow-scrolling:touch]"
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="shrink-0 snap-start w-[46%] sm:w-[230px]"
          >
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
