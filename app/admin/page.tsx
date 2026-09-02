import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { buildDashboardRows } from "@/lib/admin/dashboard-stats";
import { PieChart } from "@/components/admin/pie-chart";

// See the matching comment in app/admin/products/page.tsx — same reasoning
// (Welcome/Stats below both read live, uncached, session-keyed data).
export const instant = false;

async function Welcome() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = (data.claims as { email?: string }).email ?? "there";

  return <p className="font-medium">Signed in as {email}.</p>;
}

async function Stats() {
  const supabase = await createClient();
  const [{ data: products, error: productsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, status, price, commission_percentage"),
      supabase.from("events").select("product_id, event_type"),
    ]);

  const error = productsError ?? eventsError;
  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load stats: {error.message}
      </p>
    );
  }

  if (!products?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No products yet —{" "}
        <Link href="/admin/products/new" className="underline">
          add one
        </Link>{" "}
        to start seeing traffic here.
      </p>
    );
  }

  // Only Live products count here — a product taken back to Draft/Archived
  // shouldn't keep showing whatever traffic it got while it was Live, and
  // its events would otherwise be double-counted if it goes live again
  // under the same row.
  const liveProducts = products.filter((p) => p.status === "live");

  if (!liveProducts.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No Live products yet — traffic shows up here once a product&apos;s
        status is <strong>Live</strong>.
      </p>
    );
  }

  const rows = buildDashboardRows(liveProducts, events ?? []);
  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const totalEstimatedCommission = rows.reduce(
    (sum, r) => sum + (r.estimatedCommission ?? 0),
    0,
  );
  const anyCommissionSet = rows.some((r) => r.estimatedCommission != null);

  // Pie chart of clicks by product — the one number we actually track for
  // real, so it's the honest thing to visualize. Falls back to views when
  // nobody's clicked yet, so the chart isn't just empty on day one.
  const clicksTotal = rows.reduce((sum, r) => sum + r.clicks, 0);
  const chartByClicks = clicksTotal > 0;
  const chartData = rows
    .filter((r) => (chartByClicks ? r.clicks > 0 : r.views > 0))
    .map((r) => ({
      label: r.name,
      value: chartByClicks ? r.clicks : r.views,
      detail:
        r.commission_percentage != null
          ? `${r.commission_percentage}% commission`
          : undefined,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <div>
          <div className="text-2xl font-bold">{totalViews}</div>
          <div className="text-xs text-muted-foreground">Total views</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{totalClicks}</div>
          <div className="text-xs text-muted-foreground">Total affiliate clicks</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {anyCommissionSet ? `~₹${totalEstimatedCommission.toFixed(0)}` : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            Estimated commission (best case)
          </div>
        </div>
      </div>

      {!anyCommissionSet && (
        <p className="text-xs text-muted-foreground -mt-4">
          Set a Commission % on a product to see an estimate here — edit any
          product and fill in the Commission box.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="font-medium text-sm">
          {chartByClicks ? "Affiliate clicks by product" : "Views by product"}
        </h2>
        <PieChart data={chartData} unit={chartByClicks ? "clicks" : "views"} />
        <p className="text-xs text-muted-foreground">
          Estimates only — assumes every click converts at the product&apos;s
          listed commission %, which real sales almost never do. Amazon
          doesn&apos;t expose actual per-sale commission via API.
        </p>
      </div>
    </div>
  );
}

// This route exists at all only if you're logged in — everything under
// /admin requires auth (see lib/supabase/proxy.ts).
export default function AdminPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
        <InfoIcon size={16} strokeWidth={2} />
        This page only loads for a logged-in user — admin auth is working.
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h1 className="font-bold text-2xl">Dashboard</h1>
        <Suspense>
          <Welcome />
        </Suspense>
        <p className="text-sm text-muted-foreground">
          New here, or forgot what a page does?{" "}
          <Link href="/admin/help" className="underline font-medium text-foreground">
            Read the Help &amp; workflow guide
          </Link>
          .
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading stats…</p>}>
        <Stats />
      </Suspense>
    </div>
  );
}
