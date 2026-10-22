-- Consultant workspace. SPD consultants assess OTHER facilities' departments:
-- client → engagement (site visit) → walkthrough responses + observations →
-- report. The consulting firm is the existing spd.organizations row; every
-- table is org-scoped through spd.get_my_org_id() like the rest of the schema.
set search_path = spd, public, extensions;

-- ── Clients (facilities the consultant serves) ──────────────────────────────
create table spd.consult_clients (
  id                 uuid primary key default extensions.uuid_generate_v4(),
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  name               text not null,
  facility_type      text not null default 'hospital'
                       check (facility_type in ('hospital','asc','clinic','idn','other')),
  city               text,
  state              text,
  bed_count          integer,
  annual_surgical_cases integer,
  contact_name       text,
  contact_title      text,
  contact_email      text,
  contact_phone      text,
  notes              text,
  created_by         uuid references spd.profiles(id),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ── Engagements (one site visit / assessment) ───────────────────────────────
create table spd.consult_engagements (
  id                 uuid primary key default extensions.uuid_generate_v4(),
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  client_id          uuid not null references spd.consult_clients(id) on delete cascade,
  title              text not null,
  engagement_type    text not null default 'baseline'
                       check (engagement_type in ('baseline','mock-survey','follow-up','focused','remediation')),
  status             text not null default 'planned'
                       check (status in ('planned','on-site','drafting','delivered')),
  visit_start        date,
  visit_end          date,
  scope_areas        text[] not null default '{}',
  department_profile jsonb not null default '{}',
  executive_summary  text,
  ai_draft           text,
  delivered_at       timestamptz,
  created_by         uuid references spd.profiles(id),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index consult_engagements_client_idx on spd.consult_engagements(client_id);

-- ── Walkthrough responses (one per framework item per engagement) ───────────
create table spd.consult_responses (
  engagement_id      uuid not null references spd.consult_engagements(id) on delete cascade,
  item_id            text not null,
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  answer             text not null check (answer in ('met','partial','not-met','na')),
  note               text,
  updated_at         timestamptz default now(),
  primary key (engagement_id, item_id)
);

-- ── Observations (findings + strengths written into the report) ─────────────
create table spd.consult_observations (
  id                 uuid primary key default extensions.uuid_generate_v4(),
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  engagement_id      uuid not null references spd.consult_engagements(id) on delete cascade,
  area               text not null,
  title              text not null,
  detail             text,
  rating             text not null default 'opportunity'
                       check (rating in ('strength','opportunity','deficiency','critical')),
  standard_refs      text[] not null default '{}',
  recommendation     text,
  priority           text not null default '30-day'
                       check (priority in ('immediate','30-day','60-day','90-day')),
  owner_role         text,
  item_id            text,            -- framework item it came from, if any
  source             text not null default 'field'
                       check (source in ('walkthrough','field','library')),
  created_by         uuid references spd.profiles(id),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index consult_observations_engagement_idx on spd.consult_observations(engagement_id);

-- ── Observation photos (storage objects in the private spd-consult bucket) ──
create table spd.consult_photos (
  id                 uuid primary key default extensions.uuid_generate_v4(),
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  observation_id     uuid not null references spd.consult_observations(id) on delete cascade,
  file_path          text not null,   -- {org_id}/{engagement_id}/{observation_id}/{file}
  file_name          text not null,
  caption            text,
  uploaded_by        uuid references spd.profiles(id),
  uploaded_at        timestamptz default now()
);

-- ── Knowledge library (the consultant's own reusable findings) ──────────────
create table spd.consult_library (
  id                 uuid primary key default extensions.uuid_generate_v4(),
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  area               text not null,
  title              text not null,
  finding_text       text,
  recommendation     text,
  standard_refs      text[] not null default '{}',
  rating             text not null default 'opportunity'
                       check (rating in ('strength','opportunity','deficiency','critical')),
  priority           text not null default '30-day'
                       check (priority in ('immediate','30-day','60-day','90-day')),
  tags               text[] not null default '{}',
  use_count          integer not null default 0,
  created_by         uuid references spd.profiles(id),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ── Consultant profile / report branding (one row per user) ─────────────────
create table spd.consult_settings (
  user_id            uuid primary key references spd.profiles(id) on delete cascade,
  org_id             uuid not null references spd.organizations(id) on delete cascade,
  firm_name          text,
  consultant_name    text,
  credentials        text,            -- e.g. "CRCST, CHL, CIS"
  methodology        text,            -- printed in every report
  disclaimer         text,
  voice_notes        text,            -- how the consultant writes; fed to the AI drafter
  updated_at         timestamptz default now()
);

-- ── RLS: everything is scoped to the caller's org ───────────────────────────
alter table spd.consult_clients      enable row level security;
alter table spd.consult_engagements  enable row level security;
alter table spd.consult_responses    enable row level security;
alter table spd.consult_observations enable row level security;
alter table spd.consult_photos       enable row level security;
alter table spd.consult_library      enable row level security;
alter table spd.consult_settings     enable row level security;

create policy "consult_clients_rw" on spd.consult_clients
  using (org_id = spd.get_my_org_id()) with check (org_id = spd.get_my_org_id());
-- Child rows must also point at a parent the caller can see (the subqueries
-- are themselves RLS-filtered), so a foreign UUID can't be attached to.
create policy "consult_engagements_rw" on spd.consult_engagements
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id() and client_id in (select id from spd.consult_clients));
create policy "consult_responses_rw" on spd.consult_responses
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id() and engagement_id in (select id from spd.consult_engagements));
create policy "consult_observations_rw" on spd.consult_observations
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id() and engagement_id in (select id from spd.consult_engagements));
create policy "consult_photos_rw" on spd.consult_photos
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id() and observation_id in (select id from spd.consult_observations));
create policy "consult_library_rw" on spd.consult_library
  using (org_id = spd.get_my_org_id()) with check (org_id = spd.get_my_org_id());
-- Settings are personal: only the owner reads/writes their row.
create policy "consult_settings_rw" on spd.consult_settings
  using (user_id = auth.uid()) with check (user_id = auth.uid() and org_id = spd.get_my_org_id());

grant all on all tables in schema spd to authenticated, service_role;

-- ── Photo storage bucket (private) + org-scoped path RLS ────────────────────
insert into storage.buckets (id, name, public)
values ('spd-consult', 'spd-consult', false)
on conflict (id) do nothing;

create policy "spd_consult_select" on storage.objects for select to authenticated
  using (bucket_id = 'spd-consult' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
create policy "spd_consult_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'spd-consult' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
create policy "spd_consult_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'spd-consult' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
