import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { ListToolbar, ListPagination } from "@/components/admin/list-toolbar";
import { deleteLandingPage } from "./actions";

const PAGE_SIZE_OPTIONS = [10, 50, 100];

export default async function LandingPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}) {
  const { q, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(pageSizeParam))
    ? Number(pageSizeParam)
    : 10;

  const supabase = await createClient();
  let query = supabase
    .from("landing_pages")
    .select("*, product:products(name, status)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    // Search by slug/name here — filtering on the joined product's name
    // would need a separate query, not worth it for a simple search box.
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const from = (page - 1) * pageSize;
  const { data: landingPages, error, count } = await query.range(from, from + pageSize - 1);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load landing pages: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Landing pages"
        description="The public pages a Meta ad can actually point to — each slug is reachable at yourdomain.com/[slug], and the same slug at /go/[slug] redirects to the product's affiliate link once both are Live."
        addHref="/admin/landing-pages/new"
      />

      <p className="text-sm text-muted-foreground -mt-4">
        Bulk add/update via CSV? Head to{" "}
        <Link href="/admin/import-export" className="underline">
          Import / Export
        </Link>
        .
      </p>

      <Suspense>
        <ListToolbar searchPlaceholder="Search by name or slug…" />
      </Suspense>

      {!landingPages?.length ? (
        <EmptyState
          message={
            q
              ? `No landing pages match "${q}".`
              : "No landing pages yet. Add one, pick a product, and set it Live to make /[slug] and /go/[slug] go live."
          }
        />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Slug</th>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {landingPages.map((lp) => (
                <tr key={lp.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">/{lp.slug}</div>
                    <div className="text-muted-foreground text-xs">{lp.name}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {lp.product?.name ?? "—"}
                    {lp.product && lp.product.status !== "live" && (
                      <span className="text-xs"> (product is {lp.product.status})</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={lp.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      {lp.status === "live" ? (
                        <Link
                          href={`/${lp.slug}`}
                          target="_blank"
                          className="text-sm hover:underline"
                        >
                          View
                        </Link>
                      ) : (
                        <Link
                          href={`/preview/${lp.slug}`}
                          target="_blank"
                          className="text-sm hover:underline"
                        >
                          Preview
                        </Link>
                      )}
                      <Link
                        href={`/admin/landing-pages/${lp.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteLandingPage.bind(null, lp.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!!landingPages?.length && (
        <Suspense>
          <ListPagination page={page} pageSize={pageSize} totalCount={count ?? 0} />
        </Suspense>
      )}
    </div>
  );
}
