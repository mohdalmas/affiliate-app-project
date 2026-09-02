import { redirect } from "next/navigation";

// Every admin create/update/in-place-edit action ends with this instead of
// a plain `redirect(path)`, so the page it lands on can show a confirming
// toast (see components/admin/toast-provider.tsx's ToastParamListener) —
// the "no notification when saving" gap. `never` return matches
// redirect()'s own signature: this always throws Next's internal
// NEXT_REDIRECT signal, so nothing after a call to this ever runs.
export function redirectWithToast(path: string, message: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}toast=${encodeURIComponent(message)}`);
}
