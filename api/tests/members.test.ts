import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../app";
import { closePool, query, queryOne } from "../db";

async function cleanTestUsers() {
  await query("delete from audit_events where metadata->>'email' like '%@testinvite.com'");
  await query("delete from users where email like '%@testinvite.com'");
}

beforeAll(async () => {
  try {
    await query("select 1");
    await cleanTestUsers();
  } catch {
    throw new Error(
      "Cannot reach Postgres. Run `docker compose up -d` and `npm run setup` from the repository root.",
    );
  }
});

afterAll(async () => {
  await cleanTestUsers();
  await closePool();
});

describe("POST /api/organizations/:id/members/invite", () => {
  it("batch invites multiple new members with status 'invited' and logs activity", async () => {
    const emails = "alice@testinvite.com, bob@testinvite.com\ncharlie@testinvite.com";

    const res = await request(app)
      .post("/api/organizations/1/members/invite")
      .set("x-acme-role", "admin")
      .send({ emails, role: "member" })
      .expect(201);

    expect(res.body.invited).toHaveLength(3);
    expect(res.body.skipped).toHaveLength(0);
    expect(res.body.totalInvited).toBe(3);

    for (const member of res.body.invited) {
      expect(member.status).toBe("invited");
      expect(member.role).toBe("member");
    }

    // Verify users in database
    const dbUsers = await query<{ email: string; status: string }>(
      "select email, status from users where email like '%@testinvite.com' order by email",
    );
    expect(dbUsers).toHaveLength(3);
    expect(dbUsers[0].status).toBe("invited");

    // Verify audit log events
    const auditLogs = await query<{ action: string; metadata: { email: string; role: string } }>(
      `
        select action, metadata
        from audit_events
        where org_id = 1 and action = 'user.invited' and metadata->>'email' like '%@testinvite.com'
      `,
    );
    expect(auditLogs).toHaveLength(3);
    expect(auditLogs[0].metadata.role).toBe("member");
  });

  it("sensibly skips emails that are already members without failing new ones", async () => {
    // alice@testinvite.com already exists from previous test
    const emails = "alice@testinvite.com, david@testinvite.com";

    const res = await request(app)
      .post("/api/organizations/1/members/invite")
      .set("x-acme-role", "owner")
      .send({ emails, role: "admin" })
      .expect(201);

    expect(res.body.invited).toHaveLength(1);
    expect(res.body.invited[0].email).toBe("david@testinvite.com");
    expect(res.body.invited[0].role).toBe("admin");

    expect(res.body.skipped).toContain("alice@testinvite.com");
    expect(res.body.totalSkipped).toBe(1);
  });

  it("refuses request from a read-only member with 403", async () => {
    const res = await request(app)
      .post("/api/organizations/1/members/invite")
      .set("x-acme-role", "member")
      .send({ emails: "eve@testinvite.com", role: "member" })
      .expect(403);

    expect(res.body.error).toContain("requires");
  });

  it("refuses request with no role header with 403", async () => {
    await request(app)
      .post("/api/organizations/1/members/invite")
      .send({ emails: "eve@testinvite.com", role: "member" })
      .expect(403);
  });

  it("rejects empty or invalid email input with 400", async () => {
    const res = await request(app)
      .post("/api/organizations/1/members/invite")
      .set("x-acme-role", "admin")
      .send({ emails: "not-an-email, still-not-an-email" })
      .expect(400);

    expect(res.body.error).toContain("email");
  });

  it("rejects invalid role with 400", async () => {
    const res = await request(app)
      .post("/api/organizations/1/members/invite")
      .set("x-acme-role", "admin")
      .send({ emails: "frank@testinvite.com", role: "superadmin" })
      .expect(400);

    expect(res.body.error).toContain("role");
  });
});
