import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteLandingPage } from "./actions";

export default async function LandingPagesPage() {
  const supabase = await createClient();
  const { data: landingPages, error } = await supabase
    .from("landing_pages")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

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
        description="The public pages a Meta ad can actually point to — each one has a slug reachable at yourdomain.com/[slug], and the same slug at /go/[slug] redirects to the product's affiliate offer once it's published."
        addHref="/admin/landing-pages/new"
      />

      {!landingPages?.length ? (
        <EmptyState message="No landing pages yet. Add one, pick a product, and publish it to make /[slug] and /go/[slug] go live." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Slug</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {landingPages.map((page) => (
                <tr key={page.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">/{page.slug}</div>
                    <div className="text-muted-foreground text-xs">{page.name}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{page.page_type}</td>
                  <td className="p-3 text-muted-foreground">
                    {page.product?.name ?? "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      {page.status === "published" && (
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="text-sm hover:underline"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`/admin/landing-pages/${page.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteLandingPage.bind(null, page.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
