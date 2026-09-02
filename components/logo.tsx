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
export function Logo({
  height = 32,
  variant = "auto",
  priority,
}: {
  height?: number;
  variant?: "light" | "dark" | "auto";
  priority?: boolean;
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
          className="dark:hidden"
        />
        <Image
          src="/logo-dark.svg"
          alt="Deals Junction"
          height={height}
          width={width}
          priority={priority}
          className="hidden dark:block"
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
    />
  );
}
