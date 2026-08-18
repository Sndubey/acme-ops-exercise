-- Added after launch, when customers started asking for programmatic access.

create table api_keys (
  id            serial primary key,
  org_id        integer not null references organizations (id) on delete cascade,
  label         text not null,
  token_prefix  text not null,
  created_at    timestamptz not null default now(),
  revoked_at    timestamptz
);

create index api_keys_org_id_idx on api_keys (org_id);
