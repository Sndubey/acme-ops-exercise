import { Router } from "express";

import { HttpError, asString, parseEnum, parseId, parsePage } from "../lib/http";
import {
  ORG_STATUSES,
  PAGE_SIZE,
  PLANS,
  getActivitySeries,
  getOrgStats,
  getOrganization,
  listOrganizations,
  listRecentEvents,
} from "../queries/orgs";

export const organizationsRouter = Router();

organizationsRouter.get("/", async (req, res) => {
  const page = parsePage(req.query.page);

  const { rows, total } = await listOrganizations({
    search: asString(req.query.search),
    plan: parseEnum(req.query.plan, PLANS, "plan"),
    status: parseEnum(req.query.status, ORG_STATUSES, "status"),
    page,
  });

  res.json({ organizations: rows, total, page, pageSize: PAGE_SIZE });
});

organizationsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id, "Organization id");

  const organization = await getOrganization(id);
  if (!organization) throw new HttpError(404, "Organization not found.");

  const [stats, events, activity] = await Promise.all([
    getOrgStats(id),
    listRecentEvents(id, 12),
    getActivitySeries(id, 30),
  ]);

  res.json({ organization, stats, events, activity });
});

organizationsRouter.get("/:id/events", async (req, res) => {
  const id = parseId(req.params.id, "Organization id");
  const events = await listRecentEvents(id, 12);
  res.json({ events });
});
