import { Badge } from "@/components/ui/badge";
import type { MemberRole, MemberStatus, OrgStatus, Plan } from "@/lib/types";

type Tone = React.ComponentProps<typeof Badge>["tone"];

const PLAN_TONE: Record<Plan, Tone> = {
  free: "neutral",
  growth: "neutral",
  scale: "brass",
  enterprise: "brass",
};

const ORG_STATUS_TONE: Record<OrgStatus, Tone> = {
  trial: "caution",
  active: "positive",
  churned: "critical",
};

const MEMBER_STATUS_TONE: Record<MemberStatus, Tone> = {
  active: "positive",
  invited: "caution",
  deactivated: "neutral",
};

function PlanTag({ plan }: { plan: Plan }) {
  return (
    <Badge tone={PLAN_TONE[plan]} className="capitalize">
      {plan}
    </Badge>
  );
}

function OrgStatusTag({ status }: { status: OrgStatus }) {
  return (
    <Badge tone={ORG_STATUS_TONE[status]} dot className="capitalize">
      {status}
    </Badge>
  );
}

function MemberStatusTag({ status }: { status: MemberStatus }) {
  return (
    <Badge tone={MEMBER_STATUS_TONE[status]} dot className="capitalize">
      {status}
    </Badge>
  );
}

function RoleTag({ role }: { role: MemberRole }) {
  return (
    <Badge tone={role === "owner" ? "brass" : "neutral"} className="capitalize">
      {role}
    </Badge>
  );
}

export { PlanTag, OrgStatusTag, MemberStatusTag, RoleTag };
