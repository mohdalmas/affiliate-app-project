import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

async function Welcome() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = (data.claims as { email?: string }).email ?? "there";

  return <p className="font-medium">Signed in as {email}.</p>;
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
          </Link>{" "}
          — it walks through every section and the order you&apos;d use them
          in, plus a troubleshooting list for common errors.
        </p>
      </div>
    </div>
  );
}
