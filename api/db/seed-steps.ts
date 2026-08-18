/**
 * The seed, expressed as an ordered list of statements.
 *
 * `setseed` fixes Postgres' RNG for the session, so two runs against the same
 * schema produce identical data. Volume matters here: the console is meant to
 * be exercised against something that behaves like a real tenant list, not a
 * handful of demo rows.
 *
 * Values are derived from md5 hashes rather than `random()`. A LATERAL subquery
 * that does not reference the row it is joined to gets evaluated once for the
 * whole statement, so `random()` inside one produces the same value for every
 * row -- which quietly collapses the data. Hashing also decorrelates fields
 * from each other, so a table sorted by name does not show statuses arriving in
 * neat blocks.
 */

export type SeedStep = { label: string; sql: string };

/** Deterministic 28-bit hash of `expr`. Always non-negative. */
function hash(expr: string): string {
  return `(('x' || substr(md5(${expr}), 1, 7))::bit(28)::int)`;
}

/**
 * Weighted action list: settings and project churn dominate real activity
 * logs, key rotation barely registers.
 */
const ACTION_LIST = `array[
  'settings.updated','user.invited','project.created','export.requested',
  'user.activated','settings.updated','project.created','api_key.created',
  'user.deactivated','settings.updated','project.archived','user.invited',
  'billing.plan_changed','settings.updated','export.requested','project.created',
  'user.activated','settings.updated','api_key.revoked','user.invited'
]`;

function action(seed: string): string {
  return `(${ACTION_LIST})[1 + (${hash(seed)} % 20)]`;
}

const COMPANY_HEADS = `array[
  'Vantage','Cobalt','Harbour','Meridian','Ironwood','Fathom','Beacon','Alderman',
  'Sable','Kestrel','Lodestone','Bramble','Verity','Halcyon','Marlowe','Pinnacle',
  'Sundial','Thornbury','Willowmere','Auburn','Copperfield','Drayton','Eastgate',
  'Fernlow','Granite','Ashgrove','Belmont','Carrick','Dunmore','Elmscroft',
  'Foxglove','Glasswell','Hartland','Inglewood','Kirkstone','Larkspur','Millbrook',
  'Norbury','Oakhaven','Pemberton','Quarryhill','Ravenscar','Stonebridge','Tallow',
  'Umberton','Vellum','Westmere','Yarrow','Ambergate','Blackthorn','Cinderford',
  'Duskwood','Elmsworth','Foundry','Gullwing','Highfield','Jasper','Kingsley',
  'Loxley','Marbury','Northgate','Orchardly','Redgrave','Selby'
]`;

const COMPANY_TAILS = `array[
  'Systems','Labs','Group','Industries','Partners',
  'Analytics','Networks','Holdings','Works','Technologies'
]`;

const FIRST_NAMES = `array[
  'Ada','Bram','Cleo','Dara','Eli','Fiona','Gus','Hana','Ines','Jonah',
  'Kira','Liam','Mara','Nils','Orla','Pavel','Quinn','Rosa','Sami','Tova',
  'Umi','Vera','Wes','Xenia','Yusuf','Zara','Anwar','Beatrix','Caspar','Delphine',
  'Emeka','Fritz','Greta','Hugo','Iris','Janos','Kaito','Lena','Mateo','Noor'
]`;

const LAST_NAMES = `array[
  'Abara','Bellini','Castellan','Dunmore','Eriksen','Falk','Grimaldi','Hollis',
  'Iyer','Jarvis','Kowalski','Lindqvist','Moreau','Nakamura','Okonkwo','Pereira',
  'Quist','Rahman','Sandoval','Toledano','Ueda','Varga','Whitlock','Xu','Yilmaz',
  'Zamora','Ashford','Broadbent','Cazares','Delacroix','Ekwueme','Fontaine',
  'Guardado','Haverford','Ingersoll','Jankovic','Kettleborough','Lampert',
  'Mavrides','Nystrom'
]`;

/**
 * 617 is coprime with 1600 (40 first names x 40 surnames) and with 640
 * (64 heads x 10 suffixes), so stepping by it visits a distinct pair every
 * time and no two rows collide.
 */
const NAME_KEY = `(((u - 1) * 617 + o.id * 101) % 1600)`;
const COMPANY_KEY = `((g * 617) % 640)`;

/** Rows the bulk sync writes per transaction. */
const BULK_SYNC_BATCH = 137;

const NORTHWIND_MEMBERS = 210;
const NORTHWIND_HISTORICAL = 55000;
const NORTHWIND_TODAY = 1500;


export const seedSteps: SeedStep[] = [
  {
    label: "clear existing data",
    sql: `truncate audit_events, api_keys, projects, users, organizations restart identity cascade;`,
  },
  {
    label: "fix RNG seed",
    sql: `select setseed(0.4242);`,
  },
  {
    label: "insert flagship organization",
    sql: `
      insert into organizations (name, slug, plan, status, created_at)
      values ('Northwind Trading Co.', 'northwind', 'enterprise', 'active', now() - interval '3 years');
    `,
  },
  {
    label: "insert 199 organizations",
    sql: `
      insert into organizations (name, slug, plan, status, created_at)
      select
        n.head || ' ' || n.tail,
        lower(n.head) || '-' || lower(n.tail),
        (array['free','growth','growth','scale','scale','enterprise'])[1 + (${hash("'plan' || g::text")} % 6)],
        (array['trial','active','active','active','churned'])[1 + (${hash("'orgst' || g::text")} % 5)],
        now() - ((100 + ${hash("'age' || g::text")} % 900) || ' days')::interval
      from generate_series(1, 199) g
      cross join lateral (
        select
          (${COMPANY_HEADS})[1 + (${COMPANY_KEY} / 10)]  as head,
          (${COMPANY_TAILS})[1 + (${COMPANY_KEY} % 10)]  as tail
      ) n;
    `,
  },
  {
    label: "insert users",
    sql: `
      insert into users (org_id, email, name, role, status, created_at, last_active_at)
      select
        o.id,
        lower(p.first) || '.' || lower(p.last) || '@' || o.slug || '.test',
        p.first || ' ' || p.last,
        case
          when u = 1 then 'owner'
          when ${hash("'role' || o.id::text || '-' || u::text")} % 100 < 18 then 'admin'
          else 'member'
        end,
        case
          when u = 1 then 'active'
          else (array['active','active','active','active','active','active','active','invited','invited','deactivated'])[1 + (${hash("'stat' || o.id::text || '-' || u::text")} % 10)]
        end,
        least(now(), o.created_at + ((${hash("'made' || o.id::text || '-' || u::text")} % 400) || ' days')::interval),
        case
          when ${hash("'seen' || o.id::text || '-' || u::text")} % 4 = 0 then null
          else now() - ((${hash("'ago' || o.id::text || '-' || u::text")} % 45) || ' days')::interval
        end
      from organizations o
      cross join lateral generate_series(
        1,
        case when o.id = 1 then ${NORTHWIND_MEMBERS} else 8 + (${hash("'size' || o.id::text")} % 42) end
      ) u
      cross join lateral (
        select
          (${FIRST_NAMES})[1 + (${NAME_KEY} % 40)]        as first,
          (${LAST_NAMES})[1 + ((${NAME_KEY} / 40) % 40)]  as last
      ) p;
    `,
  },
  {
    label: "insert projects",
    sql: `
      insert into projects (org_id, name, status, created_at)
      select
        o.id,
        (array['Website','Mobile App','Data Pipeline','Billing','Internal Tools','Marketing Site','API Gateway','Warehouse Sync'])[1 + ((p * 3 + o.id) % 8)],
        case when ${hash("'proj' || o.id::text || '-' || p::text")} % 5 = 0 then 'archived' else 'active' end,
        least(now(), o.created_at + ((${hash("'pmade' || o.id::text || '-' || p::text")} % 300) || ' days')::interval)
      from organizations o
      cross join lateral generate_series(1, 2 + (${hash("'nproj' || o.id::text")} % 4)) p;
    `,
  },
  {
    label: "insert api keys",
    sql: `
      insert into api_keys (org_id, label, token_prefix, created_at, revoked_at)
      select
        o.id,
        (array['CI deploy','Warehouse sync','Zapier','Staging','Ops script'])[1 + ((k - 1) % 5)],
        'ak_' || substr(md5(o.id::text || '-' || k::text), 1, 8),
        least(now(), o.created_at + ((${hash("'kmade' || o.id::text || '-' || k::text")} % 300) || ' days')::interval),
        case
          when ${hash("'krev' || o.id::text || '-' || k::text")} % 5 = 0
            then now() - ((${hash("'kago' || o.id::text || '-' || k::text")} % 60) || ' days')::interval
          else null
        end
      from organizations o
      cross join lateral generate_series(1, ${hash("'nkeys' || o.id::text")} % 4) k;
    `,
  },
  {
    label: "build actor lookup",
    sql: `
      create temp table _org_users as
      select org_id, array_agg(id order by id) as ids, count(*)::int as n
      from users
      group by org_id;
    `,
  },
  {
    // Northwind's events arrive from a nightly bulk sync. Each batch is written
    // inside a single transaction, so every row in a batch shares created_at
    // exactly -- now() is transaction time, not statement time.
    label: "insert 55,000 historical events for Northwind",
    sql: `
      insert into audit_events (org_id, actor_user_id, action, target_type, target_id, metadata, created_at)
      select
        1,
        ou.ids[1 + (${hash("'actor' || g::text")} % ou.n)],
        ${action("'h' || g::text")},
        split_part(${action("'h' || g::text")}, '.', 1),
        'obj_' || substr(md5('h' || g::text), 1, 10),
        jsonb_build_object('source', 'bulk-sync'),
        date_trunc('day', now()) - interval '1 microsecond'
          - (((g - 1) / ${BULK_SYNC_BATCH}) * interval '538 minutes')
      from _org_users ou
      cross join lateral generate_series(1, ${NORTHWIND_HISTORICAL}) g
      where ou.org_id = 1;
    `,
  },
  {
    // Today's events have not been through the sync yet -- they arrive one at a
    // time over the API, so they each get their own timestamp.
    label: "insert 1,500 same-day events for Northwind",
    sql: `
      insert into audit_events (org_id, actor_user_id, action, target_type, target_id, metadata, created_at)
      select
        1,
        ou.ids[1 + (${hash("'tactor' || g::text")} % ou.n)],
        ${action("'t' || g::text")},
        split_part(${action("'t' || g::text")}, '.', 1),
        'obj_' || substr(md5('t' || g::text), 1, 10),
        jsonb_build_object('source', 'bulk-sync'),
        date_trunc('day', now())
          + (now() - date_trunc('day', now()))
            * ((g - 1)::float / ${NORTHWIND_TODAY}.0)
      from _org_users ou
      cross join lateral generate_series(1, ${NORTHWIND_TODAY}) g
      where ou.org_id = 1;
    `,
  },
  {
    // Every other tenant writes events one at a time through the API, so their
    // timestamps are naturally spread out.
    label: "insert events for the remaining organizations",
    sql: `
      insert into audit_events (org_id, actor_user_id, action, target_type, target_id, metadata, created_at)
      select
        ou.org_id,
        ou.ids[1 + (${hash("'oactor' || ou.org_id::text || '-' || g::text")} % ou.n)],
        ${action("'o' || ou.org_id::text || '-' || g::text")},
        split_part(${action("'o' || ou.org_id::text || '-' || g::text")}, '.', 1),
        'obj_' || substr(md5(ou.org_id::text || '-' || g::text), 1, 10),
        jsonb_build_object('source', 'api'),
        now() - (power(random(), 2) * 180) * interval '1 day'
      from _org_users ou
      cross join lateral generate_series(1, 500 + (${hash("'nev' || ou.org_id::text")} % 1450)) g
      where ou.org_id <> 1;
    `,
  },
  {
    label: "drop actor lookup",
    sql: `drop table _org_users;`,
  },
  {
    label: "analyze",
    sql: `analyze;`,
  },
];
