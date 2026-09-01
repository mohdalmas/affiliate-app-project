export const EXPERIMENT_HELP_DESCRIPTION =
  "An experiment records a specific question you're testing — a hypothesis, a control vs. a variant, and (once it's done) what actually happened. This turns 'I think X works better' into something you can look back on.";

export const EXPERIMENT_HELP_FIELDS = [
  { name: "Name", help: "e.g. “Convenience vs Price Messaging”." },
  { name: "Hypothesis", help: "What you believe and why, e.g. “Men 25-34 respond better to time-saving messaging.”" },
  { name: "Product / Audience", help: "What this experiment is about, and who it's testing on." },
  { name: "Primary metric", help: "The one number that decides win or lose, e.g. “Purchase conversion rate”." },
  { name: "Secondary metrics", help: "Anything else worth watching alongside the primary metric." },
  { name: "Control / Variant", help: "What each version actually said or did — be specific enough to recreate it." },
  { name: "Status", help: "planned → running → completed/cancelled. Marking it “completed” stamps a completion date automatically." },
  { name: "Result / Conclusion", help: "Fill in once you have data — what happened, and what you're doing about it." },
];
