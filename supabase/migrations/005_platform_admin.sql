-- Platform-admin override for the product owner. Lets the owner email see and
-- update every org's billing fields (manual / sales-led subscription mgmt).
-- Permissive policies OR with the existing org-scoped ones.

create policy "org_admin_select" on spd.organizations for select
  using (auth.jwt()->>'email' = 'terrysc107@gmail.com');

create policy "org_admin_update" on spd.organizations for update
  using (auth.jwt()->>'email' = 'terrysc107@gmail.com')
  with check (auth.jwt()->>'email' = 'terrysc107@gmail.com');
