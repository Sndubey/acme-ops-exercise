import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { OrgStatusTag, PlanTag } from "@/components/app/tags";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/ui/gauge";
import { Panel, PanelFooter, PanelHeader, PanelTitle } from "@/components/ui/panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";
import { formatDate, formatNumber, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await apiFetch<DashboardResponse>("/api/dashboard");

  const series = data.activity.map((point) => point.count);
  const peak = data.activity.reduce(
    (best, point) => (point.count > best.count ? point : best),
    data.activity[0] ?? { day: "", count: 0 },
  );

  const busiest = [...data.organizations]
    .sort((a, b) => b.events30d - a.events30d)
    .slice(0, 10);

  return (
    <>
      <PageHeader
        eyebrow={`${formatNumber(data.totals.organizations)} tenants`}
        title="Overview"
        description="Fleet-wide numbers for the last 30 days."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Gauge
          legend="Tenants"
          value={formatNumber(data.totals.organizations)}
          hint={`${formatNumber(data.totals.activeOrganizations)} on an active plan`}
        />
        <Gauge
          legend="Active members"
          value={formatNumber(data.totals.activeMembers)}
          hint="Across every tenant"
        />
        <Gauge
          legend="Events · 30 days"
          value={formatNumber(data.totals.events30d)}
          series={series}
          hint="Daily volume, all tenants"
        />
        <Gauge
          legend="Peak day"
          value={formatNumber(peak.count)}
          hint={peak.day ? formatDate(peak.day) : "No activity recorded"}
        />
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <PanelTitle>Busiest tenants</PanelTitle>
          <span className="legend">by events, last 30 days</span>
        </PanelHeader>

        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Organization</TableHeaderCell>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Members</TableHeaderCell>
              <TableHeaderCell className="text-right">Events</TableHeaderCell>
              <TableHeaderCell>Last activity</TableHeaderCell>
              <TableHeaderCell className="w-10" />
            </tr>
          </TableHead>

          <TableBody>
            {busiest.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Link
                    href={`/organizations/${org.id}`}
                    className="font-medium text-ink hover:text-brass"
                  >
                    {org.name}
                  </Link>
                  <span className="ml-2 font-mono text-[0.6875rem] text-ink-faint">
                    {org.slug}
                  </span>
                </TableCell>
                <TableCell>
                  <PlanTag plan={org.plan} />
                </TableCell>
                <TableCell>
                  <OrgStatusTag status={org.status} />
                </TableCell>
                <TableCell className="text-right tabular text-ink-soft">
                  {formatNumber(org.activeMembers)}
                </TableCell>
                <TableCell className="text-right tabular font-medium">
                  {formatNumber(org.events30d)}
                </TableCell>
                <TableCell className="text-ink-soft">
                  {formatRelative(org.lastEventAt)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/organizations/${org.id}`}
                    aria-label={`Open ${org.name}`}
                    className="block text-ink-faint hover:text-brass"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <PanelFooter>
          <span className="legend">showing 10 of {formatNumber(data.totals.organizations)}</span>
          <Button asChild size="sm">
            <Link href="/organizations">All organizations</Link>
          </Button>
        </PanelFooter>
      </Panel>
    </>
  );
}
