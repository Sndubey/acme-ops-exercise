import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { closePool, query, queryOne } from "../db";

beforeAll(async () => {
  try {
    await query("select 1");
  } catch {
    throw new Error(
      "Cannot reach Postgres. Run `docker compose up -d` and `npm run setup` from the repository root.",
    );
  }
});

afterAll(async () => {
  await closePool();
});

function parseCsvLines(csvText: string): string[][] {
  return csvText
    .trim()
    .split("\n")
    .map((line) => line.split(","));
}

describe("GET /api/organizations/:id/export/activity.csv", () => {
  it("exports all events for an organization with no duplicates and correct headers", async () => {
    // Check total events in database for org 1 (Northwind)
    const countRes = await queryOne<{ count: number }>(
      "select count(*)::int as count from audit_events where org_id = 1",
    );
    const expectedCount = countRes?.count ?? 0;
    expect(expectedCount).toBeGreaterThan(1000); // Ensures it exercises multiple batches

    const res = await request(app)
      .get("/api/organizations/1/export/activity.csv")
      .expect(200);

    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain("attachment");

    const lines = res.text.trim().split("\n");
    const header = lines[0];
    expect(header).toBe("id,created_at,action,target_type,target_id,actor");

    const dataLines = lines.slice(1);
    expect(dataLines.length).toBe(expectedCount);

    // Verify all IDs are unique (no duplicate rows)
    const ids = dataLines.map((line) => line.split(",")[0]);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(dataLines.length);
  });

  it("includes events created later in the day for the 'to' date filter", async () => {
    // Insert a test event on a specific date at 15:30 UTC
    const testDate = "2026-05-15";
    const testTimestamp = `${testDate}T15:30:00Z`;

    await query(
      `
        insert into audit_events (org_id, action, target_type, target_id, created_at)
        values (1, 'test.compliance_check', 'test', 'obj_test_1', $1::timestamptz)
      `,
      [testTimestamp],
    );

    const res = await request(app)
      .get(`/api/organizations/1/export/activity.csv?from=${testDate}&to=${testDate}`)
      .expect(200);

    expect(res.text).toContain("test.compliance_check");

    // Clean up test event
    await query("delete from audit_events where action = 'test.compliance_check'");
  });

  it("404s for an organization that does not exist", async () => {
    await request(app).get("/api/organizations/999999/export/activity.csv").expect(404);
  });

  it("400s for an invalid organization id", async () => {
    await request(app).get("/api/organizations/not-an-id/export/activity.csv").expect(400);
  });
});
