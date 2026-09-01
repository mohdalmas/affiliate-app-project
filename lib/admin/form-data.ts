// Shared FormData → Supabase payload helpers, used by every entity's
// app/admin/*/actions.ts. Supabase's query builder wants `null`, not
// empty strings, for optional columns — these normalize that.
export function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function num(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Native checkboxes only appear in FormData when checked ("on" by default).
export function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}
