/** Quotes a value only when it needs it, doubling any embedded quotes. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvLine(values: unknown[]): string {
  return `${values.map(csvCell).join(",")}\n`;
}
