export const LANDING_PAGE_HELP_DESCRIPTION =
  "A landing page is the public page a Meta ad actually points to. Its slug drives two URLs: yourdomain.com/[slug] (the page itself) and yourdomain.com/go/[slug] (the redirect to the affiliate offer) — both only go live once status is “published”.";

export const LANDING_PAGE_HELP_FIELDS = [
  { name: "Name", help: "Internal label, e.g. “Philips Trimmer Launch”." },
  { name: "Slug", help: "The URL part after your domain — letters, numbers, and hyphens only, e.g. “trimmer-a”. Must be unique across every landing page." },
  { name: "Page type", help: "“product” shows one product with a “Get the deal” button. “collection” shows a grid linking to every other published product page — pick this for a general browse page." },
  { name: "Product", help: "Required for a “product” page — which product this page is about. Not used for “collection”." },
  { name: "Status", help: "Stays “draft” (not publicly reachable) until you're ready — set to “published” to go live at /[slug] and /go/[slug]." },
];
