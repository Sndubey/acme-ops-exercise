import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { closePool, query } from "../db";

/**
 * These talk to the database. Start it first:
 *
 *   docker compose up -d
 *   npm run setup
 */
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

describe("GET /api/organizations", () => {
  it("returns the first page with a total", async () => {
    const res = await request(app).get("/api/organizations").expect(200);

    expect(res.body.organizations).toHaveLength(res.body.pageSize);
    expect(res.body.total).toBeGreaterThan(res.body.pageSize);
    expect(res.body.page).toBe(1);
  });

  it("narrows by plan", async () => {
    const res = await request(app).get("/api/organizations?plan=enterprise").expect(200);

    expect(res.body.organizations.length).toBeGreaterThan(0);
    for (const org of res.body.organizations) {
      expect(org.plan).toBe("enterprise");
    }
  });

  it("rejects an unknown plan rather than ignoring the filter", async () => {
    const res = await request(app).get("/api/organizations?plan=platinum").expect(400);
    expect(res.body.error).toContain("plan");
  });

  it("pages without repeating rows", async () => {
    const first = await request(app).get("/api/organizations?page=1").expect(200);
    const second = await request(app).get("/api/organizations?page=2").expect(200);

    const ids = new Set(first.body.organizations.map((org: { id: number }) => org.id));
    for (const org of second.body.organizations) {
      expect(ids.has(org.id)).toBe(false);
    }
  });
});

describe("GET /api/organizations/:id", () => {
  it("returns the tenant with its headline numbers", async () => {
    const res = await request(app).get("/api/organizations/1").expect(200);

    expect(res.body.organization.slug).toBe("northwind");
    expect(res.body.stats.active_members).toBeGreaterThan(0);
    expect(res.body.activity).toHaveLength(30);
  });

  it("404s for a tenant that does not exist", async () => {
    await request(app).get("/api/organizations/999999").expect(404);
  });

  it("400s for an id that is not a number", async () => {
    await request(app).get("/api/organizations/not-an-id").expect(400);
  });
});

describe("DELETE /api/organizations/:id/api-keys/:keyId", () => {
  it("refuses a request from a member", async () => {
    const res = await request(app)
      .delete("/api/organizations/1/api-keys/1")
      .set("x-acme-role", "member")
      .expect(403);

    expect(res.body.error).toContain("requires");
  });

  it("refuses a request that carries no role at all", async () => {
    await request(app).delete("/api/organizations/1/api-keys/1").expect(403);
  });
});
