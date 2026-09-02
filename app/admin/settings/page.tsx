import { TextField } from "@/components/admin/form-fields";
import { HelpPanel, FormLayout } from "@/components/admin/help-panel";
import { SubmitButton } from "@/components/admin/submit-button";
import { createClient } from "@/lib/supabase/server";
import { updateSiteSettings } from "./actions";

// Same reasoning as app/admin/products/page.tsx — reads the database on
// every request, nothing to gain from prerendering it.
export const instant = false;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("announcement_prefix, announcement_highlight")
    .eq("id", "default")
    .maybeSingle();

  return (
    <FormLayout>
      <div className="flex flex-col gap-6 max-w-xl flex-1">
        <h1 className="font-bold text-2xl">Settings</h1>
        <form action={updateSiteSettings} className="flex flex-col gap-4">
          <TextField
            name="announcement_prefix"
            label="Announcement bar — lead-in"
            defaultValue={settings?.announcement_prefix}
            placeholder="Fresh deals, verified daily —"
          />
          <TextField
            name="announcement_highlight"
            label="Announcement bar — highlight"
            defaultValue={settings?.announcement_highlight}
            placeholder="Shop smart. Save big."
          />
          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </form>
      </div>
      <HelpPanel
        title="About Settings"
        description="Site-wide text the admin can edit without a code change — right now, just the thin bar across the top of every public page."
        fields={[
          {
            name: "Announcement bar",
            help: "Two segments, shown together as one line: the lead-in in plain white, then the highlight in bold brand-orange. Leave either blank to drop that segment.",
          },
        ]}
      />
    </FormLayout>
  );
}
