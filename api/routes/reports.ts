import { Router } from "express";

import { HttpError, parseEnum } from "../lib/http";
import { PLANS } from "../queries/orgs";
import { getPlanBreakdown, getSignupsByMonth } from "../queries/reports";

export const reportsRouter = Router();

reportsRouter.get("/plan-breakdown", async (req, res) => {
  const plan = parseEnum(req.query.plan, PLANS, "plan");
  res.json({ rows: await getPlanBreakdown(plan) });
});

reportsRouter.get("/signups", async (req, res) => {
  let months = 12;
  if (req.query.months !== undefined) {
    const parsed = Number(req.query.months);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 60) {
      throw new HttpError(400, "months must be an integer between 1 and 60.");
    }
    months = parsed;
  }
  res.json({ rows: await getSignupsByMonth(months) });
});
