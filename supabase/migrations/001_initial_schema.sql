-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations
create table organizations (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  created_at timestamptz default now()
);

-- Departments
create table departments (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid references organizations(id) on delete cascade,
  name       text not null,
  code       text not null,
  created_at timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid references organizations(id),
  department_id uuid references departments(id),
  name          text,
  role          text not null default 'supervisor'
                  check (role in ('supervisor','manager','director','qa')),
  created_at    timestamptz default now()
);

-- Checklists (templates)
create table checklists (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid references organizations(id) on delete cascade,
  name        text not null,
  description text,
  category    text not null default 'custom',
  version     text not null default 'v1',
  status      text not null default 'active'
                check (status in ('draft','active','archived')),
  is_built_in boolean default false,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Checklist items
create table checklist_items (
  id            uuid primary key default uuid_generate_v4(),
  checklist_id  uuid references checklists(id) on delete cascade,
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
create table audits (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid references organizations(id) on delete cascade,
  checklist_id  uuid references checklists(id),
  department_id uuid references departments(id),
  conducted_by  uuid references profiles(id),
  status        text not null default 'in-progress'
                  check (status in ('in-progress','completed')),
  mode          text not null default 'full',
  overall_score numeric(5,2),
  started_at    timestamptz default now(),
  completed_at  timestamptz
);

-- Audit responses
create table audit_responses (
  id               uuid primary key default uuid_generate_v4(),
  audit_id         uuid references audits(id) on delete cascade,
  checklist_item_id uuid references checklist_items(id),
  item_index       integer not null,
  response         text not null check (response in ('yes','no','na')),
  comment          text,
  recorded_at      timestamptz default now()
);

-- Findings
create table findings (
  id                uuid primary key default uuid_generate_v4(),
  audit_id          uuid references audits(id) on delete cascade,
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
create table imported_datasets (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid references organizations(id) on delete cascade,
  uploaded_by     uuid references profiles(id),
  filename        text not null,
  source_type     text not null default 'csv',
  row_count       integer,
  column_mapping  jsonb,
  linked_category text,
  uploaded_at     timestamptz default now()
);

-- Reports
create table reports (
  id               uuid primary key default uuid_generate_v4(),
  org_id           uuid references organizations(id) on delete cascade,
  generated_by     uuid references profiles(id),
  report_type      text not null,
  scope            text not null default 'user',
  date_range_start timestamptz,
  date_range_end   timestamptz,
  file_url         text,
  generated_at     timestamptz default now()
);
