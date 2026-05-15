-- Enable RLS on all tables
alter table organizations     enable row level security;
alter table departments       enable row level security;
alter table profiles          enable row level security;
alter table checklists        enable row level security;
alter table checklist_items   enable row level security;
alter table audits            enable row level security;
alter table audit_responses   enable row level security;
alter table findings          enable row level security;
alter table imported_datasets enable row level security;
alter table reports           enable row level security;

-- Helper: get current user's org_id
create or replace function get_my_org_id()
returns uuid language sql security definer
as $$ select org_id from profiles where id = auth.uid() $$;

-- Helper: get current user's role
create or replace function get_my_role()
returns text language sql security definer
as $$ select role from profiles where id = auth.uid() $$;

-- Helper: get current user's department_id
create or replace function get_my_dept_id()
returns uuid language sql security definer
as $$ select department_id from profiles where id = auth.uid() $$;

-- Organizations: users see only their org
create policy "org_select" on organizations for select
  using (id = get_my_org_id());

-- Departments: users see their org's departments
create policy "dept_select" on departments for select
  using (org_id = get_my_org_id());

-- Profiles: users see their org's profiles; can update own row only
create policy "profiles_select" on profiles for select
  using (org_id = get_my_org_id());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- Checklists: all org members read; qa/manager/director write
create policy "checklists_select" on checklists for select
  using (org_id = get_my_org_id());
create policy "checklists_insert" on checklists for insert
  with check (org_id = get_my_org_id() and get_my_role() in ('qa','manager','director'));
create policy "checklists_update" on checklists for update
  using (org_id = get_my_org_id() and get_my_role() in ('qa','manager','director'));

-- Checklist items: readable by all org members; writable by qa/manager/director
create policy "checklist_items_select" on checklist_items for select
  using (checklist_id in (select id from checklists where org_id = get_my_org_id()));
create policy "checklist_items_insert" on checklist_items for insert
  with check (
    checklist_id in (
      select id from checklists
      where org_id = get_my_org_id()
        and get_my_role() in ('qa','manager','director')
    )
  );

-- Audits: supervisors see own dept only; higher roles see all
create policy "audits_select" on audits for select
  using (
    org_id = get_my_org_id() and
    (get_my_role() in ('manager','director','qa') or department_id = get_my_dept_id())
  );
create policy "audits_insert" on audits for insert
  with check (org_id = get_my_org_id());
create policy "audits_update" on audits for update
  using (
    org_id = get_my_org_id() and
    (conducted_by = auth.uid() or get_my_role() in ('manager','director'))
  );

-- Findings: same dept scoping as audits
create policy "findings_select" on findings for select
  using (
    audit_id in (
      select id from audits
      where org_id = get_my_org_id()
        and (get_my_role() in ('manager','director','qa') or department_id = get_my_dept_id())
    )
  );
create policy "findings_insert" on findings for insert
  with check (audit_id in (select id from audits where org_id = get_my_org_id()));
create policy "findings_update" on findings for update
  using (audit_id in (select id from audits where org_id = get_my_org_id()));

-- Audit responses: org-scoped read/write
create policy "responses_select" on audit_responses for select
  using (audit_id in (select id from audits where org_id = get_my_org_id()));
create policy "responses_insert" on audit_responses for insert
  with check (audit_id in (select id from audits where org_id = get_my_org_id()));

-- Reports: org-wide read
create policy "reports_select" on reports for select
  using (org_id = get_my_org_id());
create policy "reports_insert" on reports for insert
  with check (org_id = get_my_org_id());

-- Imported datasets: org-wide read
create policy "datasets_select" on imported_datasets for select
  using (org_id = get_my_org_id());
create policy "datasets_insert" on imported_datasets for insert
  with check (org_id = get_my_org_id());
