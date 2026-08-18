-- Indexes to speed up dashboard queries and audit log lookups.

create index if not exists audit_events_org_id_created_at_idx on audit_events (org_id, created_at desc);
create index if not exists audit_events_created_at_idx on audit_events (created_at);
