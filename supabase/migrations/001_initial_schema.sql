-- SPD Intel lives in a dedicated `spd` schema so it can coexist with the other
-- apps already in this Supabase project (which own `public` + `students`).
create schema if not exists spd;
grant usage on schema spd to anon, authenticated, service_role;

-- uuid_generate_v4() lives in the extensions schema
create extension if not exists "uuid-ossp" with schema extensions;

set search_path = spd, public, extensions;

-- Organizations
create table spd.organizations (
  id         uuid primary key default extensions.uuid_generate_v4(),
  name       text not null,
  created_at timestamptz default now()
);

-- Departments
create table spd.departments (
  id         uuid primary key default extensions.uuid_generate_v4(),
  org_id     uuid references spd.organizations(id) on delete cascade,
  name       text not null,
  code       text not null,
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table spd.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid references spd.organizations(id),
  department_id uuid references spd.departments(id),
  name          text,
  role          text not null default 'supervisor'
                  check (role in ('supervisor','manager','director','qa')),
  created_at    timestamptz default now()
);

-- Checklists (templates)
create table spd.checklists (
  id          uuid primary key default extensions.uuid_generate_v4(),
  org_id      uuid references spd.organizations(id) on delete cascade,
  name        text not null,
  description text,
  category    text not null default 'custom',
  version     text not null default 'v1',
  status      text not null default 'active'
                check (status in ('draft','active','archived')),
  is_built_in boolean default false,
  created_by  uuid references spd.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Checklist items
create table spd.checklist_items (
  id            uuid primary key default extensions.uuid_generate_v4(),
  checklist_id  uuid references spd.checklists(id) on delete cascade,
  question      text not null,
  rationale     text,
  response_type text not null default 'pass-fail',
  weight        integer not null default 1 check (weight between 1 and 3),
  severity      text not null default 'major'
                  check (severity in ('critical','major','minor')),
  reference_url text,
  item_order    integer not null default 0
);

-- Audits
create table spd.audits (
  id            uuid primary key default extensions.uuid_generate_v4(),
  org_id        uuid references spd.organizations(id) on delete cascade,
  checklist_id  uuid references spd.checklists(id),
  department_id uuid references spd.departments(id),
  conducted_by  uuid references spd.profiles(id),
  status        text not null default 'in-progress'
                  check (status in ('in-progress','completed')),
  mode          text not null default 'full',
  overall_score numeric(5,2),
  started_at    timestamptz default now(),
  completed_at  timestamptz
);

-- Audit responses
create table spd.audit_responses (
  id                uuid primary key default extensions.uuid_generate_v4(),
  audit_id          uuid references spd.audits(id) on delete cascade,
  checklist_item_id uuid references spd.checklist_items(id),
  item_index        integer not null,
  response          text not null check (response in ('yes','no','na')),
  comment           text,
  recorded_at       timestamptz default now()
);

-- Findings
create table spd.findings (
  id                uuid primary key default extensions.uuid_generate_v4(),
  audit_id          uuid references spd.audits(id) on delete cascade,
  item_index        integer not null,
  section_name      text,
  question          text not null,
  severity          text not null check (severity in ('critical','major','minor')),
  status            text not null default 'open'
                      check (status in ('open','in-progress','resolved')),
  comment           text,
  corrective_action text,
  resolved_at       timestamptz,
  created_at        timestamptz default now()
);

-- Imported datasets
create table spd.imported_datasets (
  id              uuid primary key default extensions.uuid_generate_v4(),
  org_id          uuid references spd.organizations(id) on delete cascade,
  uploaded_by     uuid references spd.profiles(id),
  filename        text not null,
  source_type     text not null default 'csv',
  row_count       integer,
  column_mapping  jsonb,
  linked_category text,
  uploaded_at     timestamptz default now()
);

-- Reports
create table spd.reports (
  id               uuid primary key default extensions.uuid_generate_v4(),
  org_id           uuid references spd.organizations(id) on delete cascade,
  generated_by     uuid references spd.profiles(id),
  report_type      text not null,
  scope            text not null default 'user',
  date_range_start timestamptz,
  date_range_end   timestamptz,
  file_url         text,
  generated_at     timestamptz default now()
);

-- PostgREST roles need table privileges (RLS still gates the rows)
grant all on all tables    in schema spd to authenticated, service_role;
grant all on all sequences in schema spd to authenticated, service_role;
alter default privileges in schema spd grant all on tables    to authenticated, service_role;
alter default privileges in schema spd grant all on sequences to authenticated, service_role;
