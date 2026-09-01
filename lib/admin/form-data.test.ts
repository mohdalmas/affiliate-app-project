import { describe, it, expect } from "vitest";
import { str, num, bool } from "./form-data";

function formDataWith(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

describe("str", () => {
  it("returns the trimmed value when present", () => {
    expect(str(formDataWith({ name: "  Trimmer  " }), "name")).toBe("Trimmer");
  });

  it("returns null for a missing field", () => {
    expect(str(new FormData(), "name")).toBeNull();
  });

  it("returns null for an empty or whitespace-only field, not an empty string", () => {
    // This is the one that matters: Supabase treats "" and null very
    // differently for an optional text column, and every *Payload()
    // function in app/admin/*/actions.ts relies on this.
    expect(str(formDataWith({ name: "" }), "name")).toBeNull();
    expect(str(formDataWith({ name: "   " }), "name")).toBeNull();
  });
});

describe("num", () => {
  it("parses a numeric string", () => {
    expect(num(formDataWith({ price: "1299.5" }), "price")).toBe(1299.5);
  });

  it("returns null when missing, empty, or not a number", () => {
    expect(num(new FormData(), "price")).toBeNull();
    expect(num(formDataWith({ price: "" }), "price")).toBeNull();
    expect(num(formDataWith({ price: "not-a-number" }), "price")).toBeNull();
  });

  it("treats 0 as a real value, not a missing one", () => {
    expect(num(formDataWith({ price: "0" }), "price")).toBe(0);
  });
});

describe("bool", () => {
  it("is true only for a checked native checkbox's default value", () => {
    expect(bool(formDataWith({ paid_traffic_allowed: "on" }), "paid_traffic_allowed")).toBe(true);
  });

  it("is false when the field is absent — this is how an unchecked checkbox behaves", () => {
    // Unchecked checkboxes don't appear in FormData at all. Every
    // affiliate offer defaults to paid_traffic_allowed = false because of
    // this — see ARCHITECTURE.md's compliance findings.
    expect(bool(new FormData(), "paid_traffic_allowed")).toBe(false);
  });
});
