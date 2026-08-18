import { Router } from "express";

import { getPlanBreakdown, getSignupsByMonth } from "../legacy/reports";

export const reportsRouter = Router();

reportsRouter.get("/plan-breakdown", async (req, res) => {
  res.json({ rows: await getPlanBreakdown(req.query.plan) });
});

reportsRouter.get("/signups", async (req, res) => {
  res.json({ rows: await getSignupsByMonth(req.query.months) });
});
