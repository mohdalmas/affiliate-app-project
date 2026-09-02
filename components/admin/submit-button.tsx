"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

// Wraps the shadcn Button with useFormStatus so every Create/Save/Import
// button shows its own pending state automatically — no per-form useState
// needed anywhere. Must be rendered inside the <form> whose pending state
// it reads (React wires this up via context, not props).
export function SubmitButton({
  children,
  pendingText = "Saving…",
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
