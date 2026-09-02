import Image from "next/image";

// The brand mark: cart glyph + "Deals Junction" wordmark + tagline, all
// baked into the SVG (public/logo.svg / logo-dark.svg) so it always renders
// crisp at any size. "light" (ink-on-transparent) is for a surface that's
// always light; "dark" (white-on-transparent) is for a surface that's
// always dark (e.g. the footer's constant ink bar, DisclosureFooter — see
// its own call site). Source viewBox is 480x120 — keep that ratio at
// whatever height is asked for.
//
// Default is "auto": the navbar/header sit on `bg-card`, which itself
// flips dark under the site's .dark theme (system dark mode, or a
// visitor's own toggle) — a fixed "light" variant there went invisible
// (dark ink text on a now-dark background) on a phone in dark mode. "auto"
// renders both SVGs and lets Tailwind's `dark:` variant (driven by the
// same .dark class) pick the right one, in pure CSS — no useTheme() hook,
// no hydration-mismatch flash, works even before JS loads.
//
// `height` sets the intrinsic size (what `width`/`height` attributes Next
// gives the <img>, for aspect-ratio + layout reservation) — pass the
// asset's actual target size here (e.g. the same value used on the public
// site, to keep them "the same logo"). `className` can still scale the
// *displayed* box responsively (e.g. `h-10 sm:h-14 w-auto`) since it's an
// SVG — CSS size always wins over the HTML attributes, and there's no
// raster blur to worry about at any size.
export function Logo({
  height = 32,
  variant = "auto",
  priority,
  className,
}: {
  height?: number;
  variant?: "light" | "dark" | "auto";
  priority?: boolean;
  className?: string;
}) {
  const width = Math.round((height * 480) / 120);

  if (variant === "auto") {
    return (
      <>
        <Image
          src="/logo.svg"
          alt="Deals Junction"
          height={height}
          width={width}
          priority={priority}
          className={cx("dark:hidden", className)}
        />
        <Image
          src="/logo-dark.svg"
          alt="Deals Junction"
          height={height}
          width={width}
          priority={priority}
          className={cx("hidden dark:block", className)}
        />
      </>
    );
  }

  return (
    <Image
      src={variant === "dark" ? "/logo-dark.svg" : "/logo.svg"}
      alt="Deals Junction"
      height={height}
      width={width}
      priority={priority}
      className={className}
    />
  );
}

// Not lib/utils's `cn()` (that's clsx + tailwind-merge, for resolving
// conflicting utility classes) — this just needs to concatenate a fixed
// visibility class with an optional caller-supplied one, in order, with
// nothing to dedupe.
function cx(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
