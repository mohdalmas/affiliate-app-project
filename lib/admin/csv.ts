// Minimal CSV parser/serializer — handles quoted fields, embedded
// commas/quotes/newlines inside quotes, both CRLF and LF line endings,
// and a leading UTF-8 BOM (Excel adds one on save). Good enough for a
// hand-edited-in-Excel spreadsheet; not meant to handle every CSV dialect
// that exists, so a full library wasn't worth adding as a dependency.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  while (i < source.length) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      i += 1;
      continue; // swallow — the following \n (or end of input) ends the row
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  // Last field/row — the file may or may not end with a trailing newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully blank trailing lines (a single empty cell).
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(
  rows: (string | number | boolean | null | undefined)[][],
): string {
  return rows
    .map((row) =>
      row.map((cell) => csvEscape(cell == null ? "" : String(cell))).join(","),
    )
    .join("\r\n");
}
