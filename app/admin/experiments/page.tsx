import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeader, EmptyState, StatusBadge } from "@/components/admin/list-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteExperiment } from "./actions";

export default async function ExperimentsPage() {
  const supabase = await createClient();
  const { data: experiments, error } = await supabase
    .from("experiments")
    .select("*, product:products(name), audience:audiences(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load experiments: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Experiments"
        description="A/B hypotheses, not just vibes: a control vs. a variant, a primary metric, and a written conclusion once it's done."
        addHref="/admin/experiments/new"
      />

      {!experiments?.length ? (
        <EmptyState message="No experiments yet. Write down a hypothesis and a control vs. variant before you run anything." />
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Hypothesis</th>
                <th className="p-3 font-medium">Product / Audience</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((experiment) => (
                <tr key={experiment.id} className="border-t align-top">
                  <td className="p-3 font-medium">{experiment.name}</td>
                  <td className="p-3 text-muted-foreground max-w-xs">
                    {experiment.hypothesis}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {[experiment.product?.name, experiment.audience?.name]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={experiment.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/admin/experiments/${experiment.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton onDelete={deleteExperiment.bind(null, experiment.id)} />
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
