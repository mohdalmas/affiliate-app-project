import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteAudience } from "./actions";

export default async function AudiencesPage() {
  const supabase = await createClient();
  const { data: audiences, error } = await supabase
    .from("audiences")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load audiences: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Audiences"
        description="Who you're targeting — age, gender, location, interests. Used by Campaigns and Experiments so an ad has a specific 'who', not a guess."
        addHref="/admin/audiences/new"
      />

      {!audiences?.length ? (
        <EmptyState message="No audiences yet. Add one to describe who a campaign or experiment targets (age, gender, location, interests)." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Age</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {audiences.map((audience) => (
                <tr key={audience.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{audience.name}</div>
                    {audience.gender && (
                      <div className="text-muted-foreground text-xs">
                        {audience.gender}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {audience.age_min != null || audience.age_max != null
                      ? `${audience.age_min ?? "?"}–${audience.age_max ?? "?"}`
                      : "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {audience.location ?? "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={audience.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/audiences/${audience.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteAudience.bind(null, audience.id)} />
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
