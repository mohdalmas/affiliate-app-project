import { describe, it, expect } from "vitest";
import { buildImportSummaryMessage } from "./import-summary";

describe("buildImportSummaryMessage", () => {
  it("reports every counter with no errors", () => {
    expect(
      buildImportSummaryMessage(
        [
          { label: "products created", count: 3 },
          { label: "products updated", count: 1 },
        ],
        [],
      ),
    ).toBe("products created 3, products updated 1.");
  });

  it("appends every error when under the cap", () => {
    const msg = buildImportSummaryMessage(
      [{ label: "created", count: 0 }],
      ["row 2: bad", "row 3: bad"],
    );
    expect(msg).toContain("2 error(s): row 2: bad; row 3: bad");
    expect(msg).not.toContain("more");
  });

  it("caps the shown errors and notes how many more there were", () => {
    const errors = Array.from({ length: 12 }, (_, i) => `row ${i}: bad`);
    const msg = buildImportSummaryMessage([{ label: "created", count: 0 }], errors, 8);
    expect(msg).toContain("12 error(s):");
    expect(msg).toContain("(+4 more)");
  });
});
