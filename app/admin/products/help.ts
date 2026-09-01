// Shared between new/page.tsx and [id]/edit/page.tsx so the field
// explanations in the HelpPanel don't drift between "add" and "edit".
export const PRODUCT_HELP_DESCRIPTION =
  "A product is anything you're considering promoting — added here before you have an approved affiliate offer for it. Nothing is required except a name, and you can edit it later.";

export const PRODUCT_HELP_FIELDS = [
  { name: "Name", help: "Required. What you'd call it internally, e.g. “Philips Beard Trimmer”." },
  { name: "Brand", help: "Optional manufacturer/brand name." },
  { name: "Category / Subcategory", help: "Optional grouping, e.g. “Mens Grooming” / “Beard Trimmer”." },
  { name: "Price / Currency", help: "What it sells for — for your own reference; nothing calculates from this yet." },
  { name: "Rating / Review count", help: "Optional, copied from wherever you found it (Amazon listing, etc.) — a rough signal of demand." },
  { name: "Product URL / Image URL", help: "Optional links to the original listing/photo, for your own reference." },
  { name: "Status", help: "Where it is in your pipeline: research → shortlisted → testing → winner, or killed/archived if you drop it." },
  { name: "Hypothesis", help: "Why you think this product could work — which audience, which angle." },
];
