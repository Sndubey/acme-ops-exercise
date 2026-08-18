import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { FilterForm } from "@/components/app/filter-form";
import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { OrgStatusTag, PlanTag } from "@/components/app/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelFooter, PanelHeader, PanelTitle } from "@/components/ui/panel";
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
import type { OrganizationsResponse } from "@/lib/types";
import { firstParam, formatDate, formatNumber, queryString } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = firstParam(sp.search);
  const plan = firstParam(sp.plan);
  const status = firstParam(sp.status);
  const page = Number(firstParam(sp.page) ?? 1) || 1;

  const data = await apiFetch<OrganizationsResponse>(
    `/api/organizations${queryString({ search, plan, status, page })}`,
  );

  const filtered = Boolean(search || plan || status);

  return (
    <>
      <PageHeader
        eyebrow={`${formatNumber(data.total)} matching`}
        title="Organizations"
        description="Every tenant on the platform."
      />

      <Panel>
        <PanelHeader>
          <PanelTitle>Directory</PanelTitle>

          <FilterForm className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
              />
              <Input
                name="search"
                defaultValue={search ?? ""}
                placeholder="Search by name"
                aria-label="Search organizations by name"
                className="w-52 pl-8"
              />
            </div>

            <Select name="plan" defaultValue={plan ?? ""} aria-label="Filter by plan">
              <option value="">Any plan</option>
              <option value="free">Free</option>
              <option value="growth">Growth</option>
              <option value="scale">Scale</option>
              <option value="enterprise">Enterprise</option>
            </Select>

            <Select name="status" defaultValue={status ?? ""} aria-label="Filter by status">
              <option value="">Any status</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="churned">Churned</option>
            </Select>

            <Button type="submit" size="md" variant="primary">
              Search
            </Button>

            {filtered ? (
              <Button asChild size="md" variant="quiet">
                <Link href="/organizations">Clear</Link>
              </Button>
            ) : null}
          </FilterForm>
        </PanelHeader>

        {data.organizations.length === 0 ? (
          <EmptyState
            title="No organizations match these filters."
            action={
              filtered ? (
                <Button asChild size="sm">
                  <Link href="/organizations">Clear filters</Link>
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Organization</TableHeaderCell>
                <TableHeaderCell>Plan</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Members</TableHeaderCell>
                <TableHeaderCell>Customer since</TableHeaderCell>
                <TableHeaderCell className="w-10" />
              </tr>
            </TableHead>

            <TableBody>
              {data.organizations.map((org) => (
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
                    {formatNumber(org.member_count)}
                  </TableCell>
                  <TableCell className="text-ink-soft">{formatDate(org.created_at)}</TableCell>
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
        )}

        <PanelFooter>
          <Pagination
            basePath="/organizations"
            params={{ search, plan, status }}
            page={data.page}
            total={data.total}
            pageSize={data.pageSize}
            noun="organizations"
          />
        </PanelFooter>
      </Panel>
    </>
  );
}
