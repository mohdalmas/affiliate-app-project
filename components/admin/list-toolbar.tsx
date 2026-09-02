"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

const PAGE_SIZE_OPTIONS = [10, 50, 100];

// Search box + page-size picker for a list page. Both write to the URL
// (?q=...&pageSize=...&page=1) so the actual filtering/pagination stays on
// the server (the page component re-queries Supabase) — this component's
// only job is to update the URL and show a small pending state while that
// server round-trip is in flight, via useTransition.
export function ListToolbar({
  searchPlaceholder,
}: {
  searchPlaceholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Debounce typing so we don't push a new URL (and re-run the Supabase
  // query) on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (query === current) return;
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function setPageSize(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", value);
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="max-w-xs"
        aria-label="Search"
      />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Rows per page
        <select
          value={searchParams.get("pageSize") ?? "10"}
          onChange={(e) => setPageSize(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      {isPending && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Loading…
        </span>
      )}
    </div>
  );
}

// Prev/Next + "page X of Y" — same URL-driven, useTransition-based pattern
// as the toolbar above, so pagination and search share one loading signal.
export function ListPagination({
  page,
  pageSize,
  totalCount,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {totalCount === 0
          ? "No results"
          : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`}
        {isPending && <span className="ml-2 animate-pulse">Loading…</span>}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1 || isPending}
          className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages || isPending}
          className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
