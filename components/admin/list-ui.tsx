import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SectionHeader({
  title,
  description,
  addHref,
  addLabel = "Add new",
}: {
  title: string;
  description?: string;
  addHref?: string;
  addLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {addHref && (
        <Button asChild size="sm" className="shrink-0">
          <Link href={addHref}>{addLabel}</Link>
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-md">
      {message}
    </p>
  );
}

// Rough, shared color coding so "winner"/"active"/"published" read as good
// news and "killed"/"archived" read as put-away — not meant to be exact
// per-table semantics, just a visual hint.
const GOOD_STATUSES = new Set(["winner", "active", "published", "completed"]);
const MUTED_STATUSES = new Set(["killed", "archived", "cancelled", "expired"]);

export function StatusBadge({ status }: { status: string }) {
  const variant = GOOD_STATUSES.has(status)
    ? "default"
    : MUTED_STATUSES.has(status)
      ? "outline"
      : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}
