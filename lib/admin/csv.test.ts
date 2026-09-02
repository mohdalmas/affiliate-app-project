import { describe, it, expect } from "vitest";
import { parseCsv, toCsv } from "./csv";

describe("parseCsv", () => {
  it("parses a simple comma-separated file", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles CRLF line endings, same as LF", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("strips a leading UTF-8 BOM (Excel adds one on save)", () => {
    expect(parseCsv("﻿name,price\nTrimmer,1299")).toEqual([
      ["name", "price"],
      ["Trimmer", "1299"],
    ]);
  });

  it("keeps a comma inside a quoted field as part of the value", () => {
    expect(parseCsv('name,note\n"Trimmer, Pro Edition",ok')).toEqual([
      ["name", "note"],
      ["Trimmer, Pro Edition", "ok"],
    ]);
  });

  it("unescapes a doubled quote inside a quoted field", () => {
    expect(parseCsv('name\n"Say ""hi"""')).toEqual([["name"], ['Say "hi"']]);
  });

  it("handles a newline embedded inside a quoted field", () => {
    expect(parseCsv('name,note\nA,"line one\nline two"')).toEqual([
      ["name", "note"],
      ["A", "line one\nline two"],
    ]);
  });

  it("returns an empty array for an empty file, not a phantom row", () => {
    expect(parseCsv("")).toEqual([]);
  });
});

describe("toCsv", () => {
  it("quotes a field containing a comma", () => {
    expect(toCsv([["Trimmer, Pro"]])).toBe('"Trimmer, Pro"');
  });

  it("escapes an embedded quote by doubling it", () => {
    expect(toCsv([['Say "hi"']])).toBe('"Say ""hi"""');
  });

  it("renders null/undefined as an empty cell, not the literal word", () => {
    expect(toCsv([[null, undefined, "x"]])).toBe(",,x");
  });

  it("round-trips through parseCsv for values needing escaping", () => {
    const original = [["a,b", 'c"d', "plain"]];
    expect(parseCsv(toCsv(original))).toEqual([["a,b", 'c"d', "plain"]]);
  });
});
