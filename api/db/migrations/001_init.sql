-- Initial schema for the operations console.

create table organizations (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  plan        text not null check (plan in ('free', 'growth', 'scale', 'enterprise')),
  status      text not null default 'active' check (status in ('trial', 'active', 'churned')),
  created_at  timestamptz not null default now()
);

create table users (
  id              serial primary key,
  org_id          integer not null references organizations (id) on delete cascade,
  email           text not null,
  name            text not null,
  role            text not null check (role in ('owner', 'admin', 'member')),
  status          text not null default 'invited' check (status in ('active', 'invited', 'deactivated')),
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz
);

create unique index users_org_email_key on users (org_id, lower(email));
create index users_org_id_idx on users (org_id);

create table projects (
  id          serial primary key,
  org_id      integer not null references organizations (id) on delete cascade,
  name        text not null,
  status      text not null default 'active' check (status in ('active', 'archived')),
  created_at  timestamptz not null default now()
);

create index projects_org_id_idx on projects (org_id);

-- Append-only activity log. Written by the ingest worker, read by the console
-- and by CSV export.
create table audit_events (
  id              bigserial primary key,
  org_id          integer not null references organizations (id) on delete cascade,
  actor_user_id   integer references users (id) on delete set null,
  action          text not null,
  target_type     text not null,
  target_id       text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null
);
