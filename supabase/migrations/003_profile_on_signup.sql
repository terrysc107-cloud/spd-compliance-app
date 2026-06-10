-- Profile-on-signup for SPD Intel.
--
-- NOTE: this project's `auth.users` is shared with other apps, which already
-- have their own `on_auth_user_created` trigger. We add a SEPARATE trigger that
-- only acts when the signup carries SPD metadata (`org_name`), so non-SPD
-- signups are untouched. On an SPD signup it provisions the org + a default
-- department + the manager profile so RLS returns rows immediately.

create or replace function spd.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = spd, public
as $$
declare
  new_org  uuid;
  new_dept uuid;
begin
  -- Only handle SPD Intel signups (identified by the org_name metadata field).
  if new.raw_user_meta_data ? 'org_name' then
    insert into spd.organizations (name)
    values (coalesce(nullif(trim(new.raw_user_meta_data->>'org_name'), ''), 'My Facility'))
    returning id into new_org;

    insert into spd.departments (org_id, name, code)
    values (new_org, 'Central Sterile', 'CS')
    returning id into new_dept;

    insert into spd.profiles (id, org_id, department_id, name, role)
    values (
      new.id,
      new_org,
      new_dept,
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      'manager'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_spd on auth.users;
create trigger on_auth_user_created_spd
  after insert on auth.users
  for each row execute function spd.handle_new_user();
