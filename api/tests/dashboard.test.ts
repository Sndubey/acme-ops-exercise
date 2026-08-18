import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { closePool, query } from "../db";

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

describe("GET /api/dashboard", () => {
  it("returns fleet overview numbers, activity, and totals", async () => {
    const res = await request(app).get("/api/dashboard").expect(200);

    expect(res.body.organizations).toBeInstanceOf(Array);
    expect(res.body.organizations.length).toBeGreaterThan(0);

    const first = res.body.organizations[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("slug");
    expect(first).toHaveProperty("plan");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("activeMembers");
    expect(first).toHaveProperty("events30d");
    expect(first).toHaveProperty("lastEventAt");

    expect(res.body.activity).toHaveLength(30);

    expect(res.body.totals).toEqual({
      organizations: res.body.organizations.length,
      activeOrganizations: expect.any(Number),
      activeMembers: expect.any(Number),
      events30d: expect.any(Number),
    });
  });
});
