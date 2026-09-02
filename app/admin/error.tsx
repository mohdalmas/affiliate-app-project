"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Catches every thrown error from any /admin page or server action (a
// validation message like "Title is required", a friendly Postgres
// conflict message, a real bug) and shows it as a readable card instead
// of Next's default crash overlay — the other half of "no notification
// when saving": the happy path gets a toast (see toast-provider.tsx /
// lib/admin/toast-redirect.ts), the unhappy path gets this.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto mt-16 text-center items-center">
      <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
        {error.message || "Something went wrong."}
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
