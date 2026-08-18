import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { ApiKeyActions } from "@/components/app/api-key-actions";
import { EmptyState } from "@/components/app/empty-state";
import { ExportPanel } from "@/components/app/export-panel";
import { FilterForm } from "@/components/app/filter-form";
import { MemberActions } from "@/components/app/member-actions";
import { PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { RecentActivity } from "@/components/app/recent-activity";
import { MemberStatusTag, OrgStatusTag, PlanTag, RoleTag } from "@/components/app/tags";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/ui/gauge";
import { Input } from "@/components/ui/input";
import { Panel, PanelBody, PanelFooter, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { ApiError, apiFetch, apiUrl } from "@/lib/api";
import { can } from "@/lib/roles";
import { requireSession } from "@/lib/session";
import type { ApiKey, MembersResponse, OrganizationResponse } from "@/lib/types";
import {
  firstParam,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelative,
  isoDate,
  queryString,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const orgId = Number(id);
  if (!Number.isInteger(orgId) || orgId < 1) notFound();

  const sp = await searchParams;
  const search = firstParam(sp.search);
  const role = firstParam(sp.role);
  const status = firstParam(sp.status);
  const page = Number(firstParam(sp.page) ?? 1) || 1;

  let detail: OrganizationResponse;
  try {
    detail = await apiFetch<OrganizationResponse>(`/api/organizations/${orgId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [session, members, keys] = await Promise.all([
    requireSession(),
    apiFetch<MembersResponse>(
      `/api/organizations/${orgId}/members${queryString({ search, role, status, page })}`,
    ),
    apiFetch<{ apiKeys: ApiKey[] }>(`/api/organizations/${orgId}/api-keys`),
  ]);

  const { organization: org, stats, events, activity } = detail;
  const canManage = can(session, ["owner", "admin"]);
  const filtered = Boolean(search || role || status);

  const today = new Date();
  const defaultTo = isoDate(today);
  const defaultFrom = isoDate(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));

  return (
    <>
      <PageHeader
        eyebrow={org.slug}
        title={org.name}
        description={`Customer since ${formatDate(org.created_at)}.`}
        actions={
          <>
            <PlanTag plan={org.plan} />
            <OrgStatusTag status={org.status} />
            <Button asChild size="sm" variant="quiet">
              <Link href="/organizations">Back to directory</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Gauge
          legend="Active members"
          value={formatNumber(stats.active_members)}
          hint={`${formatNumber(stats.invited_members)} invited, not yet joined`}
        />
        <Gauge
          legend="Projects"
          value={formatNumber(stats.projects)}
          hint="Active projects"
        />
        <Gauge
          legend="Events · 30 days"
          value={formatNumber(stats.events_30d)}
          series={activity.map((point) => point.count)}
          hint={`Last seen ${formatRelative(stats.last_event_at)}`}
        />
        <Gauge
          legend="Events · all time"
          value={formatNumber(stats.total_events)}
          hint="Everything in the activity log"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader>
            <PanelTitle>Members</PanelTitle>

            <FilterForm className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
                />
                <Input
                  name="search"
                  defaultValue={search ?? ""}
                  placeholder="Name or email"
                  aria-label="Search members"
                  className="w-44 pl-8"
                />
              </div>

              <Select name="role" defaultValue={role ?? ""} aria-label="Filter by role">
                <option value="">Any role</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </Select>

              <Select name="status" defaultValue={status ?? ""} aria-label="Filter by status">
                <option value="">Any status</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="deactivated">Deactivated</option>
              </Select>

              {filtered ? (
                <Button asChild size="md" variant="quiet">
                  <Link href={`/organizations/${orgId}`}>Clear</Link>
                </Button>
              ) : null}
            </FilterForm>
          </PanelHeader>

          {members.members.length === 0 ? (
            <EmptyState
              title="No members match these filters."
              action={
                filtered ? (
                  <Button asChild size="sm">
                    <Link href={`/organizations/${orgId}`}>Clear filters</Link>
                  </Button>
                ) : null
              }
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Member</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Last active</TableHeaderCell>
                  {canManage ? <TableHeaderCell className="text-right">Actions</TableHeaderCell> : null}
                </tr>
              </TableHead>

              <TableBody>
                {members.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <span className="block font-medium text-ink">{member.name}</span>
                      <span className="block font-mono text-[0.6875rem] text-ink-faint">
                        {member.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RoleTag role={member.role} />
                    </TableCell>
                    <TableCell>
                      <MemberStatusTag status={member.status} />
                    </TableCell>
                    <TableCell className="text-ink-soft">
                      {formatRelative(member.last_active_at)}
                    </TableCell>
                    {canManage ? (
                      <TableCell>
                        <MemberActions
                          orgId={orgId}
                          memberId={member.id}
                          memberName={member.name}
                          status={member.status}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <PanelFooter>
            <Pagination
              basePath={`/organizations/${orgId}`}
              params={{ search, role, status }}
              page={members.page}
              total={members.total}
              pageSize={members.pageSize}
              noun="members"
            />
          </PanelFooter>
        </Panel>

        <div className="space-y-6">
          <RecentActivity orgId={orgId} initialEvents={events} />

          <ExportPanel
            action={apiUrl(`/api/organizations/${orgId}/export/activity.csv`)}
            defaultFrom={defaultFrom}
            defaultTo={defaultTo}
          />

          <Panel>
            <PanelHeader>
              <PanelTitle>API keys</PanelTitle>
              <span className="legend">{keys.apiKeys.length} issued</span>
            </PanelHeader>

            <PanelBody className="px-0 py-0">
              {keys.apiKeys.length === 0 ? (
                <EmptyState title="This tenant has not created any API keys." className="py-8" />
              ) : (
                <ul>
                  {keys.apiKeys.map((key) => (
                    <li
                      key={key.id}
                      className="row-flush flex items-center justify-between gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-[0.8125rem] font-medium text-ink">
                          {key.label}
                        </span>
                        <span className="block font-mono text-[0.6875rem] text-ink-faint">
                          {key.token_prefix}
                          {key.revoked_at ? " · revoked" : ""}
                        </span>
                      </div>

                      {canManage && !key.revoked_at ? (
                        <ApiKeyActions orgId={orgId} keyId={key.id} label={key.label} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </>
  );
}
