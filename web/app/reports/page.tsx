import Link from "next/link";

import { FilterForm } from "@/components/app/filter-form";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { firstParam, formatNumber, queryString } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PlanRow = { plan: string; orgs: string; members: string };
type SignupRow = { month: string; orgs: string };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const plan = firstParam(sp.plan);

  const [breakdown, signups] = await Promise.all([
    apiFetch<{ rows: PlanRow[] }>(`/api/reports/plan-breakdown${queryString({ plan })}`),
    apiFetch<{ rows: SignupRow[] }>(`/api/reports/signups${queryString({ months: 12 })}`),
  ]);

  const peakSignups = signups.rows.reduce(
    (max, row) => Math.max(max, Number(row.orgs)),
    1,
  );

  return (
    <>
      <PageHeader
        eyebrow="finance"
        title="Reports"
        description="Plan mix and signup volume, as pulled for the monthly board pack."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader>
            <PanelTitle>Plan breakdown</PanelTitle>

            <FilterForm className="flex items-center gap-2">
              <Select name="plan" defaultValue={plan ?? ""} aria-label="Filter by plan">
                <option value="">All plans</option>
                <option value="free">Free</option>
                <option value="growth">Growth</option>
                <option value="scale">Scale</option>
                <option value="enterprise">Enterprise</option>
              </Select>

              {plan ? (
                <Button asChild size="md" variant="quiet">
                  <Link href="/reports">Clear</Link>
                </Button>
              ) : null}
            </FilterForm>
          </PanelHeader>

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Plan</TableHeaderCell>
                <TableHeaderCell className="text-right">Organizations</TableHeaderCell>
                <TableHeaderCell className="text-right">Active members</TableHeaderCell>
              </tr>
            </TableHead>

            <TableBody>
              {breakdown.rows.map((row) => (
                <TableRow key={row.plan}>
                  <TableCell className="font-medium capitalize text-ink">{row.plan}</TableCell>
                  <TableCell className="text-right tabular">{formatNumber(row.orgs)}</TableCell>
                  <TableCell className="text-right tabular text-ink-soft">
                    {formatNumber(row.members)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Signups by month</PanelTitle>
            <span className="legend">last 12 months</span>
          </PanelHeader>

          <PanelBody className="space-y-2 py-4">
            {signups.rows.map((row) => (
              <div key={row.month} className="flex items-center gap-3">
                <span className="w-16 shrink-0 font-mono text-[0.6875rem] text-ink-faint">
                  {row.month}
                </span>
                <div className="surface-well h-4 flex-1 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-gradient-to-b from-brass-hi to-brass"
                    style={{ width: `${(Number(row.orgs) / peakSignups) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs tabular text-ink-soft">
                  {formatNumber(row.orgs)}
                </span>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
