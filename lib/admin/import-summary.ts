// Turns a CSV import's results into one short message, shown via a query
// param on the list page after redirecting back to it (no client JS
// needed to display it — see components/admin/csv-tools.tsx).
export function buildImportSummaryMessage(
  counts: { label: string; count: number }[],
  errors: string[],
  maxErrors = 8,
): string {
  const parts = [`${counts.map((c) => `${c.label} ${c.count}`).join(", ")}.`];

  if (errors.length > 0) {
    const shown = errors.slice(0, maxErrors);
    const remaining = errors.length - shown.length;
    parts.push(
      `${errors.length} error(s): ${shown.join("; ")}${
        remaining > 0 ? ` (+${remaining} more)` : ""
      }`,
    );
  }

  return parts.join(" ");
}
