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
      <div className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1">
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
