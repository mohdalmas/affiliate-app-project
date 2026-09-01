"use client";

import { useTransition } from "react";

// A small confirm-then-call wrapper around a server action, so every
// "Delete" button in the admin gets the same "are you sure" prompt instead
// of deleting on a single misclick.
export function DeleteButton({
  onDelete,
  label = "Delete",
  confirmMessage = "Delete this? This cannot be undone.",
}: {
  onDelete: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => {
            onDelete();
          });
        }
      }}
      className="text-sm text-destructive hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}
