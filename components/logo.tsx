import Image from "next/image";

// The brand mark (public/logo.png) already bakes in the wordmark and
// tagline, so this is just a sized, aspect-ratio-correct <Image> wrapper —
// used in both the public site header and the admin header, so there's one
// place to change if the logo file ever changes.
export function Logo({ height = 32, priority }: { height?: number; priority?: boolean }) {
  // Source file is 1320x1000 — keep that ratio at whatever height is asked for.
  const width = Math.round((height * 1320) / 1000);
  return (
    <Image
      src="/logo.png"
      alt="Deals Junction"
      height={height}
      width={width}
      priority={priority}
      className="rounded-sm"
    />
  );
}
