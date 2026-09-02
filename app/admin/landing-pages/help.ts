export const LANDING_PAGE_HELP_DESCRIPTION =
  "A landing page is the public page a Meta ad actually points to. Its slug drives two URLs: yourdomain.com/[slug] (the page itself) and yourdomain.com/go/[slug] (the redirect to the affiliate link) — both only go live once status is Live.";

export const LANDING_PAGE_HELP_FIELDS = [
  { name: "Name", help: "Internal label, e.g. “Philips Trimmer Launch”." },
  { name: "Slug", help: "The URL part after your domain — letters, numbers, and hyphens only, e.g. “trimmer-a”. Must be unique across every landing page." },
  { name: "Product", help: "Required — which product this page is about." },
  { name: "Status", help: "Draft: not publicly reachable. Live: goes live at /[slug] and /go/[slug] — but the redirect still won't work unless the product itself is also Live with Paid traffic allowed checked." },
];
