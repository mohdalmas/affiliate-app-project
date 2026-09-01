import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "al_sid";
// 180 days — long enough to attribute a purchase that happens a while
// after the ad click, short enough that it isn't effectively forever.
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

// The cookie itself is set by lib/supabase/proxy.ts on every request (so it
// exists before any page or route handler runs) — this just reads it back.
// Server Components and Route Handlers can't set cookies themselves outside
// of that proxy step, so this is read-only by design.
export async function getSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}
