// Fills the empty space beside every add/edit form with plain-language
// documentation: what this page is for, and what each field means. Meant
// to be read once, not memorized — so someone new to the app (or the same
// person six months from now) doesn't need ARCHITECTURE.md open to know
// what to type into "Angle" or why "Paid traffic allowed" defaults to off.
export function HelpPanel({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields?: { name: string; help: string }[];
}) {
  return (
    <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20 self-start">
      <div className="rounded-md border bg-muted/30 p-4 flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-semibold text-sm">{title}</h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {description}
          </p>
        </div>
        {fields && fields.length > 0 && (
          <dl className="flex flex-col gap-3 border-t pt-3">
            {fields.map((field) => (
              <div key={field.name}>
                <dt className="font-medium text-xs">{field.name}</dt>
                <dd className="text-muted-foreground text-xs leading-relaxed">
                  {field.help}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  );
}

// Puts the form and its HelpPanel side by side on wide screens, stacked
// (panel below the form) on narrow ones.
export function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {children}
    </div>
  );
}
