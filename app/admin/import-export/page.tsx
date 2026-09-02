import { SectionHeader } from "@/components/admin/list-ui";
import { CsvTools, ImportSummaryBanner } from "@/components/admin/csv-tools";

// See the matching comment in app/admin/products/page.tsx — same reasoning
// (this page reads `searchParams.importSummary` on every load).
export const instant = false;

export default async function ImportExportPage({
  searchParams,
}: {
  searchParams: Promise<{ importSummary?: string }>;
}) {
  const { importSummary } = await searchParams;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <SectionHeader
        title="Import / Export"
        description="Bulk-manage Products and Landing pages together with one CSV file. Export first if you want to see the exact column layout before editing and re-importing."
      />

      <ImportSummaryBanner message={importSummary} />
      <CsvTools />
    </div>
  );
}
