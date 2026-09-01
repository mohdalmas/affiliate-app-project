#!/usr/bin/env node
// A route-reachability smoke test — the kind of check done by hand with
// curl throughout this build, turned into something repeatable. Requires
// the dev server already running (`npm run dev` in another terminal).
//
// What this checks: every known route returns the *expected* status code
// — public pages 200, admin pages 307 (redirect to login) when logged
// out, removed/nonexistent pages 404. This catches route regressions and
// auth-gating mistakes (a public page accidentally requiring login, or
// worse, an admin page that stopped requiring it) — NOT whether a form
// actually saves the right data. See TESTING.md for what unit tests
// (`npm test`) cover instead, and what neither covers yet.
//
// Usage: npm run smoke  (or: BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs)

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const CHECKS = [
  // Public pages — reachable with no login, per Stage 10.
  { path: "/", expect: 200, note: "homepage" },
  { path: "/privacy", expect: 200 },
  { path: "/affiliate-disclosure", expect: 200 },
  { path: "/auth/login", expect: 200 },

  // Removed on purpose (Stage 3's "Admin access" — no public sign-up).
  { path: "/auth/sign-up", expect: 404, note: "sign-up was intentionally removed" },

  // A slug with no published landing page — should 404, not crash.
  { path: "/this-slug-should-never-exist-vzk3x", expect: 404 },

  // Admin pages — logged out, every one of these must redirect to login.
  // If any of these ever comes back 200, that's a real data leak, not a
  // cosmetic bug.
  { path: "/admin", expect: 307 },
  { path: "/admin/help", expect: 307 },
  { path: "/admin/products", expect: 307 },
  { path: "/admin/products/new", expect: 307 },
  { path: "/admin/offers", expect: 307 },
  { path: "/admin/audiences", expect: 307 },
  { path: "/admin/creatives", expect: 307 },
  { path: "/admin/campaigns", expect: 307 },
  { path: "/admin/experiments", expect: 307 },
  { path: "/admin/landing-pages", expect: 307 },
  { path: "/admin/metrics", expect: 307 },
  { path: "/admin/analytics", expect: 307 },
];

async function checkOne({ path, expect, note }) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const pass = res.status === expect;
    return { path, expect, actual: res.status, pass, note };
  } catch (err) {
    return { path, expect, actual: `ERROR: ${err.message}`, pass: false, note };
  }
}

const results = await Promise.all(CHECKS.map(checkOne));

for (const r of results) {
  const icon = r.pass ? "✓" : "✗";
  const label = r.note ? `${r.path}  (${r.note})` : r.path;
  console.log(`${icon} ${label} — expected ${r.expect}, got ${r.actual}`);
}

const failures = results.filter((r) => !r.pass);
console.log(
  `\n${results.length - failures.length}/${results.length} passed.`,
);

if (failures.length > 0) {
  console.log(
    "\nIf every check just failed with a connection error, the dev server " +
      "probably isn't running — start it with `npm run dev` in another " +
      "terminal first.",
  );
  process.exit(1);
}
