set search_path = spd, public, extensions;

-- Enable RLS on all tables
alter table spd.organizations     enable row level security;
alter table spd.departments       enable row level security;
alter table spd.profiles          enable row level security;
alter table spd.checklists        enable row level security;
alter table spd.checklist_items   enable row level security;
alter table spd.audits            enable row level security;
alter table spd.audit_responses   enable row level security;
alter table spd.findings          enable row level security;
alter table spd.imported_datasets enable row level security;
alter table spd.reports           enable row level security;

-- Helper: get current user's org_id
create or replace function spd.get_my_org_id()
returns uuid language sql security definer set search_path = spd, public
as $$ select org_id from spd.profiles where id = auth.uid() $$;

-- Helper: get current user's role
create or replace function spd.get_my_role()
returns text language sql security definer set search_path = spd, public
as $$ select role from spd.profiles where id = auth.uid() $$;

-- Helper: get current user's department_id
create or replace function spd.get_my_dept_id()
returns uuid language sql security definer set search_path = spd, public
as $$ select department_id from spd.profiles where id = auth.uid() $$;

-- Organizations: users see only their org
create policy "org_select" on spd.organizations for select
  using (id = spd.get_my_org_id());

-- Departments: users see their org's departments
create policy "dept_select" on spd.departments for select
  using (org_id = spd.get_my_org_id());

-- Profiles: users see their org's profiles; can update own row only
create policy "profiles_select" on spd.profiles for select
  using (org_id = spd.get_my_org_id());
create policy "profiles_update_own" on spd.profiles for update
  using (id = auth.uid());

-- Checklists: all org members read; qa/manager/director write
create policy "checklists_select" on spd.checklists for select
  using (org_id = spd.get_my_org_id());
create policy "checklists_insert" on spd.checklists for insert
  with check (org_id = spd.get_my_org_id() and spd.get_my_role() in ('qa','manager','director'));
create policy "checklists_update" on spd.checklists for update
  using (org_id = spd.get_my_org_id() and spd.get_my_role() in ('qa','manager','director'));

-- Checklist items: readable by all org members; writable by qa/manager/director
create policy "checklist_items_select" on spd.checklist_items for select
  using (checklist_id in (select id from spd.checklists where org_id = spd.get_my_org_id()));
create policy "checklist_items_insert" on spd.checklist_items for insert
  with check (
    checklist_id in (
      select id from spd.checklists
      where org_id = spd.get_my_org_id()
        and spd.get_my_role() in ('qa','manager','director')
    )
  );

-- Audits: supervisors see own dept only; higher roles see all
create policy "audits_select" on spd.audits for select
  using (
    org_id = spd.get_my_org_id() and
    (spd.get_my_role() in ('manager','director','qa') or department_id = spd.get_my_dept_id())
  );
create policy "audits_insert" on spd.audits for insert
  with check (org_id = spd.get_my_org_id());
create policy "audits_update" on spd.audits for update
  using (
    org_id = spd.get_my_org_id() and
    (conducted_by = auth.uid() or spd.get_my_role() in ('manager','director'))
  );

-- Findings: same dept scoping as audits
create policy "findings_select" on spd.findings for select
  using (
    audit_id in (
      select id from spd.audits
      where org_id = spd.get_my_org_id()
        and (spd.get_my_role() in ('manager','director','qa') or department_id = spd.get_my_dept_id())
    )
  );
create policy "findings_insert" on spd.findings for insert
  with check (audit_id in (select id from spd.audits where org_id = spd.get_my_org_id()));
create policy "findings_update" on spd.findings for update
  using (audit_id in (select id from spd.audits where org_id = spd.get_my_org_id()));

-- Audit responses: org-scoped read/write
create policy "responses_select" on spd.audit_responses for select
  using (audit_id in (select id from spd.audits where org_id = spd.get_my_org_id()));
create policy "responses_insert" on spd.audit_responses for insert
  with check (audit_id in (select id from spd.audits where org_id = spd.get_my_org_id()));

-- Reports: org-wide read/write
create policy "reports_select" on spd.reports for select
  using (org_id = spd.get_my_org_id());
create policy "reports_insert" on spd.reports for insert
  with check (org_id = spd.get_my_org_id());

-- Imported datasets: org-wide read/write
create policy "datasets_select" on spd.imported_datasets for select
  using (org_id = spd.get_my_org_id());
create policy "datasets_insert" on spd.imported_datasets for insert
  with check (org_id = spd.get_my_org_id());
