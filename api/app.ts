import cors from "cors";
import express from "express";

import { loadEnv } from "./lib/env";
import { errorHandler, notFoundHandler } from "./lib/http";
import { apiKeysRouter } from "./routes/api-keys";
import { dashboardRouter } from "./routes/dashboard";
import { exportsRouter } from "./routes/exports";
import { membersRouter } from "./routes/members";
import { organizationsRouter } from "./routes/organizations";
import { reportsRouter } from "./routes/reports";

loadEnv();

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routers with deeper paths mount first so their routes are matched before the
// organizations router gets a chance at "/:id".
app.use("/api/organizations", membersRouter);
app.use("/api/organizations", apiKeysRouter);
app.use("/api/organizations", exportsRouter);
app.use("/api/organizations", organizationsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
