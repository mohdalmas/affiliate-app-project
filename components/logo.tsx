import Image from "next/image";

// The brand mark: cart glyph + "Deals Junction" wordmark + tagline, all
// baked into the SVG (public/logo.svg / logo-dark.svg) so it always renders
// crisp at any size. "light" (ink-on-transparent) is for the white navbar;
// "dark" (white-on-transparent) is for the dark footer. Source viewBox is
// 480x120 — keep that ratio at whatever height is asked for.
export function Logo({
  height = 32,
  variant = "light",
  priority,
}: {
  height?: number;
  variant?: "light" | "dark";
  priority?: boolean;
}) {
  const width = Math.round((height * 480) / 120);
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
