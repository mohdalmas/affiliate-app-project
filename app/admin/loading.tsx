// Next.js shows this automatically while navigating between /admin pages
// (App Router's loading.tsx convention) — covers plain link clicks between
// Dashboard/Products/Landing pages/Import-Export, on top of the per-form
// pending states from SubmitButton and per-list Suspense fallbacks.
export default function AdminLoading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden
      />
      Loading…
    </div>
  );
}
