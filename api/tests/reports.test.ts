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

describe("GET /api/reports/plan-breakdown", () => {
  it("returns all plans breakdown", async () => {
    const res = await request(app).get("/api/reports/plan-breakdown").expect(200);

    expect(res.body.rows).toBeInstanceOf(Array);
    expect(res.body.rows.length).toBeGreaterThan(0);

    const first = res.body.rows[0];
    expect(first).toHaveProperty("plan");
    expect(first).toHaveProperty("orgs");
    expect(first).toHaveProperty("members");
    expect(typeof first.orgs).toBe("number");
    expect(typeof first.members).toBe("number");
  });

  it("filters by specific valid plan", async () => {
    const res = await request(app)
      .get("/api/reports/plan-breakdown?plan=enterprise")
      .expect(200);

    expect(res.body.rows).toHaveLength(1);
    expect(res.body.rows[0].plan).toBe("enterprise");
  });

  it("rejects an invalid plan parameter with 400", async () => {
    const res = await request(app)
      .get("/api/reports/plan-breakdown?plan=ultra-vip")
      .expect(400);

    expect(res.body.error).toContain("plan");
  });
});

describe("GET /api/reports/signups", () => {
  it("returns 12 months signups by default", async () => {
    const res = await request(app).get("/api/reports/signups").expect(200);

    expect(res.body.rows).toBeInstanceOf(Array);
    expect(res.body.rows.length).toBeGreaterThan(0);

    const first = res.body.rows[0];
    expect(first).toHaveProperty("month");
    expect(first).toHaveProperty("orgs");
    expect(typeof first.orgs).toBe("number");
  });

  it("accepts a custom months parameter", async () => {
    const res = await request(app).get("/api/reports/signups?months=6").expect(200);
    expect(res.body.rows).toBeInstanceOf(Array);
  });

  it("rejects invalid months with 400", async () => {
    const res = await request(app).get("/api/reports/signups?months=invalid").expect(400);
    expect(res.body.error).toContain("months");
  });

  it("rejects out of range months with 400", async () => {
    const res = await request(app).get("/api/reports/signups?months=100").expect(400);
    expect(res.body.error).toContain("months");
  });
});
