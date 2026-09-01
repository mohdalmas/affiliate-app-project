import "server-only";
import { createClient } from "@supabase/supabase-js";

// The service-role client bypasses Row Level Security entirely. It exists
// for exactly two things: the public pages (Stage 10) reading products/
// landing pages/offers without a logged-in session, and the /go/[slug]
// redirect (Stage 12) writing an `events` row without one. Both are
// server-only code (a Server Component's render, or a Route Handler) —
// the `server-only` import above makes it a build error to accidentally
// pull this into anything that ships to the browser.
//
// Never add a public RLS policy as an alternative to this — see
// ARCHITECTURE.md's "Row Level Security" cautions. The key itself never
// leaves the server, which is what actually makes this safe.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Get it from the Supabase " +
        "dashboard → Project Settings → API → service_role key (secret), " +
        "and add it to .env as SUPABASE_SERVICE_ROLE_KEY=... (no " +
        "NEXT_PUBLIC_ prefix — this key must never reach the browser). " +
        "See ARCHITECTURE.md Stage 10.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
