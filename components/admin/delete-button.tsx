"use client";

import { useTransition } from "react";
import { useToast } from "./toast-provider";

// A small confirm-then-call wrapper around a server action, so every
// "Delete" button in the admin gets the same "are you sure" prompt instead
// of deleting on a single misclick — and now, the same toast on the way
// out: this used to fire onDelete() with nothing awaiting or catching it,
// so a failed delete (or a successful one) was silently invisible.
//
// `disabledReason`: for a delete a caller already knows will be rejected
// (e.g. a product with a Live landing page) — pass it to show *why*
// up front, as a title tooltip, instead of making the admin click Delete
// just to learn that from the resulting error toast. The server action
// still enforces the real rule either way; this is only the UI half.
export function DeleteButton({
  onDelete,
  label = "Delete",
  confirmMessage = "Delete this? This cannot be undone.",
  successMessage = "Deleted",
  disabledReason,
}: {
  onDelete: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
  successMessage?: string;
  disabledReason?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (disabledReason) {
    return (
      <span
        title={disabledReason}
        className="text-sm text-muted-foreground/60 cursor-not-allowed underline decoration-dotted"
      >
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await onDelete();
            showToast(successMessage, "success");
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Delete failed", "error");
          }
        });
      }}
      className="text-sm text-destructive hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}
