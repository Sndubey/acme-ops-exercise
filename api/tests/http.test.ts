import { describe, expect, it } from "vitest";

import { csvCell, csvLine } from "../lib/csv";
import { HttpError, asString, parseEnum, parseId, parsePage } from "../lib/http";

describe("asString", () => {
  it("trims and returns a plain string", () => {
    expect(asString("  growth ")).toBe("growth");
  });

  it("takes the first value when a parameter repeats", () => {
    expect(asString(["a", "b"])).toBe("a");
  });

  it("treats blank and missing as absent", () => {
    expect(asString("   ")).toBeUndefined();
    expect(asString(undefined)).toBeUndefined();
  });
});

describe("parseId", () => {
  it("accepts positive integers", () => {
    expect(parseId("42", "Organization id")).toBe(42);
  });

  it("rejects anything else", () => {
    for (const bad of ["0", "-1", "1.5", "abc", undefined]) {
      expect(() => parseId(bad, "Organization id")).toThrow(HttpError);
    }
  });
});

describe("parsePage", () => {
  it("defaults to the first page", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("nope")).toBe(1);
  });

  it("reads a valid page number", () => {
    expect(parsePage("7")).toBe(7);
  });
});

describe("parseEnum", () => {
  const plans = ["free", "growth"] as const;

  it("passes through a known value", () => {
    expect(parseEnum("growth", plans, "plan")).toBe("growth");
  });

  it("returns undefined when the filter is absent", () => {
    expect(parseEnum(undefined, plans, "plan")).toBeUndefined();
  });

  it("rejects an unknown value rather than ignoring it", () => {
    expect(() => parseEnum("enterprise", plans, "plan")).toThrow(HttpError);
  });
});

describe("csv", () => {
  it("leaves ordinary values alone", () => {
    expect(csvCell("user.invited")).toBe("user.invited");
  });

  it("renders null as an empty field", () => {
    expect(csvCell(null)).toBe("");
  });

  it("quotes separators and doubles embedded quotes", () => {
    expect(csvCell('Northwind, "the big one"')).toBe('"Northwind, ""the big one"""');
  });

  it("writes dates in ISO 8601", () => {
    expect(csvCell(new Date("2026-08-18T09:30:00.000Z"))).toBe("2026-08-18T09:30:00.000Z");
  });

  it("joins a row and terminates it", () => {
    expect(csvLine(["1", null, "a,b"])).toBe('1,,"a,b"\n');
  });
});
