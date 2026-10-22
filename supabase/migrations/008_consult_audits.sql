-- Instant audits: a consultant spots a gap, starts a focused audit on the spot,
-- and samples are logged daily (observed directly or keyed in from the
-- client's paper forms) to show measured improvement over the engagement.
-- Templates live in code (lib/consult/audits/templates.ts); rows store the
-- template id plus a frozen copy of the item list so later template edits
-- never rewrite history.
set search_path = spd, public, extensions;

create table spd.consult_audits (
  id             uuid primary key default extensions.uuid_generate_v4(),
  org_id         uuid not null references spd.organizations(id) on delete cascade,
  engagement_id  uuid not null references spd.consult_engagements(id) on delete cascade,
  observation_id uuid references spd.consult_observations(id) on delete set null,
  template_id    text not null,
  title          text not null,
  items          jsonb not null,          -- [{id, text, critical}] frozen at start
  sample_unit    text not null,           -- "load", "tray", "scope cycle", …
  target_per_day integer not null default 5 check (target_per_day between 1 and 200),
  status         text not null default 'active' check (status in ('active','closed')),
  started_on     date not null default current_date,
  created_by     uuid references spd.profiles(id),
  created_at     timestamptz default now()
);
create index consult_audits_engagement_idx on spd.consult_audits(engagement_id);

create table spd.consult_audit_samples (
  id          uuid primary key default extensions.uuid_generate_v4(),
  org_id      uuid not null references spd.organizations(id) on delete cascade,
  audit_id    uuid not null references spd.consult_audits(id) on delete cascade,
  sampled_on  date not null,              -- when the audit was performed (not keyed in)
  sample_ref  text,                       -- "Sterilizer 2 · Load 4", tray name, scope serial
  source      text not null default 'observed' check (source in ('observed','paper')),
  auditor     text,                       -- who performed it (client staff on paper audits)
  answers     jsonb not null,             -- {itemId: 'yes'|'no'|'na'}
  note        text,
  created_by  uuid references spd.profiles(id),
  created_at  timestamptz default now()
);
create index consult_audit_samples_audit_idx on spd.consult_audit_samples(audit_id, sampled_on);

alter table spd.consult_audits        enable row level security;
alter table spd.consult_audit_samples enable row level security;

create policy "consult_audits_rw" on spd.consult_audits
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id() and engagement_id in (select id from spd.consult_engagements));
create policy "consult_audit_samples_rw" on spd.consult_audit_samples
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id() and audit_id in (select id from spd.consult_audits));

grant all on spd.consult_audits, spd.consult_audit_samples to authenticated, service_role;
