import Link from "next/link";
import { SubmitButton } from "@/components/admin/submit-button";
import { importCombinedCsv } from "@/lib/admin/combined-import-action";

// One combined Export/Import — a single CSV covers both Products and
// Landing pages together (see lib/admin/combined-csv.ts for the row
// format). Lives on its own admin tab (app/admin/import-export) so there's
// only one place to look for it, instead of a copy on both list pages.
export function CsvTools() {
  return (
    <div className="flex flex-col gap-2 border rounded-md p-3 bg-muted/30">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <a
          href="/sample-data/product-import-template.csv"
          download
          className="underline hover:no-underline"
        >
          Download sample CSV
        </a>
        <span className="text-muted-foreground">·</span>
        <Link href="/admin/export" className="underline hover:no-underline">
          Export CSV
        </Link>
        <span className="text-muted-foreground">·</span>
        {/* No encType here on purpose — React 19 manages that itself for a
            function `action` (a Server Action) and overrides/warns if you
            set it manually. This isn't cosmetic: it's how file uploads
            actually reach the server correctly through a Server Action. */}
        <form action={importCombinedCsv} className="flex items-center gap-2">
          <input type="hidden" name="returnTo" value="/admin/import-export" />
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="text-xs file:mr-2 file:rounded-md file:border file:bg-background file:px-2 file:py-1 file:text-xs"
          />
          <SubmitButton pendingText="Importing…" size="sm" variant="outline">
            Import CSV
          </SubmitButton>
        </form>
      </div>
      <p className="text-xs text-muted-foreground">
        New to this? Start from{" "}
        <a href="/sample-data/product-import-template.csv" download className="underline">
          the sample CSV
        </a>{" "}
        above — three example rows showing the format. One CSV covers both
        Products and Landing pages together — required columns:
        product_name (everything else is optional, including every
        landing_page_* column, which you can leave blank for a product with
        no landing page yet). Leave the id columns blank, or leave them out
        of the file entirely, to create new rows — an id is generated
        automatically after import.
      </p>
    </div>
  );
}

// The import action redirects back to this tab with ?importSummary=... —
// this renders that one-off result. No client JS needed to show it, but
// it's also gone on the next navigation, which is fine for a one-time
// "here's what just happened" message.
export function ImportSummaryBanner({ message }: { message?: string }) {
  if (!message) return null;

  const isError = /error\(s\)|^No file|^File has/.test(message);

  return (
    <div
      className={`text-sm p-3 rounded-md ${
        isError
          ? "bg-destructive/10 text-destructive"
          : "bg-accent text-foreground"
      }`}
    >
      {message}
    </div>
  );
}
