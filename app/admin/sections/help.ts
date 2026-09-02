export const SECTION_HELP_DESCRIPTION =
  "A home section is one named shelf on the public homepage (\"Today's Verified Hot Deals\", \"Last Minute Deals\", ...) — a scrollable row of deals, filled two ways that can be combined: a Category (auto-pulls every Live product in it) and/or hand-picked landing pages below. Sections render top to bottom by Position; a section with nothing Live in it just doesn't show up.";

export const SECTION_HELP_FIELDS = [
  { name: "Title", help: "The shelf heading a visitor sees, e.g. “Today's Verified Hot Deals”." },
  { name: "Subtitle", help: "Optional small caption under the title, e.g. “Curated daily with maximum savings”." },
  { name: "Category", help: "Optional — auto-fills this shelf with every Live product in that category (newest first), no manual picking needed. Combine with hand-picked items below to also pin specific ones; duplicates are skipped." },
  { name: "Position", help: "Lower numbers show first on the homepage. Sections tie-break by creation order." },
  { name: "Status", help: "Draft: hidden from the homepage entirely, even if it has items. Live: shows up, once it has at least one Live item (from its Category and/or hand-picked list)." },
];
