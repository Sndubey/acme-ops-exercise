/** Response shapes returned by the API. Kept in step with api/queries/orgs.ts. */

export type Plan = "free" | "growth" | "scale" | "enterprise";
export type OrgStatus = "trial" | "active" | "churned";
export type MemberRole = "owner" | "admin" | "member";
export type MemberStatus = "active" | "invited" | "deactivated";

export type Organization = {
  id: number;
  name: string;
  slug: string;
  plan: Plan;
  status: OrgStatus;
  created_at: string;
};

export type OrganizationListItem = Organization & {
  member_count: number;
};

export type Member = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
  last_active_at: string | null;
};

export type ActivityEvent = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
  actor_name: string | null;
};

export type ApiKey = {
  id: number;
  label: string;
  token_prefix: string;
  created_at: string;
  revoked_at: string | null;
};

export type OrgStats = {
  active_members: number;
  invited_members: number;
  projects: number;
  total_events: number;
  events_30d: number;
  last_event_at: string | null;
};

export type ActivityPoint = { day: string; count: number };

export type OrganizationsResponse = {
  organizations: OrganizationListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type OrganizationResponse = {
  organization: Organization;
  stats: OrgStats;
  events: ActivityEvent[];
  activity: ActivityPoint[];
};

export type MembersResponse = {
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
};

export type DashboardResponse = {
  organizations: Array<{
    id: number;
    name: string;
    slug: string;
    plan: Plan;
    status: OrgStatus;
    activeMembers: number;
    events30d: number;
    lastEventAt: string | null;
  }>;
  activity: ActivityPoint[];
  totals: {
    organizations: number;
    activeOrganizations: number;
    activeMembers: number;
    events30d: number;
  };
};
