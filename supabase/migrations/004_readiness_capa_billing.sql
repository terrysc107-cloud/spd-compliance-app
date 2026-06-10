set search_path = spd, public, extensions;

-- ── Readiness config + thresholds (off localStorage, onto the org) ───────────
alter table spd.organizations add column pass_threshold       integer not null default 90;
alter table spd.organizations add column marginal_threshold   integer not null default 70;
alter table spd.organizations add column next_survey_date      date;
alter table spd.departments   add column next_survey_date      date;
alter table spd.departments   add column required_checklist_ids uuid[] default '{}';
alter table spd.audits        add column audit_score           jsonb;   -- persisted engine output

-- ── CAPA: upgrade findings into tracked corrective actions ───────────────────
alter table spd.findings add column assigned_to uuid references spd.profiles(id);
alter table spd.findings add column due_date    date;
alter table spd.findings add column resolved_by uuid references spd.profiles(id);

create table spd.finding_evidence (
  id          uuid primary key default extensions.uuid_generate_v4(),
  finding_id  uuid not null references spd.findings(id) on delete cascade,
  org_id      uuid not null references spd.organizations(id) on delete cascade,
  file_path   text not null,   -- storage object path: {org_id}/{finding_id}/{file}
  file_name   text not null,
  file_type   text,
  uploaded_by uuid references spd.profiles(id),
  uploaded_at timestamptz default now()
);
alter table spd.finding_evidence enable row level security;
create policy "evidence_rw" on spd.finding_evidence
  using (org_id = spd.get_my_org_id())
  with check (org_id = spd.get_my_org_id());

-- ── Readiness trend snapshots ────────────────────────────────────────────────
create table spd.readiness_snapshots (
  id            uuid primary key default extensions.uuid_generate_v4(),
  org_id        uuid not null references spd.organizations(id) on delete cascade,
  department_id uuid references spd.departments(id) on delete cascade,
  score         numeric(5,2) not null,
  band          text not null check (band in ('ready','at-risk','not-ready')),
  factors       jsonb not null,
  captured_at   timestamptz default now()
);
alter table spd.readiness_snapshots enable row level security;
create policy "snap_select" on spd.readiness_snapshots for select
  using (org_id = spd.get_my_org_id());
create policy "snap_insert" on spd.readiness_snapshots for insert
  with check (org_id = spd.get_my_org_id());

-- ── Manual / sales-led billing: gate access on an org flag ───────────────────
alter table spd.organizations add column subscription_status text not null default 'trial'
  check (subscription_status in ('trial','active','past_due','canceled'));
alter table spd.organizations add column plan                 text;
alter table spd.organizations add column subscription_renews_at date;   -- renewal countdown

-- Re-grant for the new tables (default privileges cover these, belt-and-suspenders)
grant all on all tables in schema spd to authenticated, service_role;

-- ── Evidence storage bucket (private) + org-scoped path RLS ──────────────────
insert into storage.buckets (id, name, public)
values ('spd-evidence', 'spd-evidence', false)
on conflict (id) do nothing;

create policy "spd_evidence_select" on storage.objects for select to authenticated
  using (bucket_id = 'spd-evidence' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
create policy "spd_evidence_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'spd-evidence' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
create policy "spd_evidence_update" on storage.objects for update to authenticated
  using (bucket_id = 'spd-evidence' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
create policy "spd_evidence_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'spd-evidence' and (storage.foldername(name))[1] = spd.get_my_org_id()::text);
