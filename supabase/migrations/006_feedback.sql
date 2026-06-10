-- In-app beta feedback. Any authenticated user can submit; submitters can read
-- their own, and the platform owner can read all.
set search_path = spd, public, extensions;

create table spd.feedback (
  id         uuid primary key default extensions.uuid_generate_v4(),
  org_id     uuid references spd.organizations(id) on delete set null,
  user_id    uuid references auth.users(id) on delete set null,
  email      text,
  message    text not null,
  category   text not null default 'idea' check (category in ('idea','bug','other')),
  page       text,
  created_at timestamptz default now()
);

alter table spd.feedback enable row level security;

create policy "feedback_insert" on spd.feedback for insert to authenticated
  with check (true);
create policy "feedback_select_own" on spd.feedback for select
  using (user_id = auth.uid());
create policy "feedback_admin_select" on spd.feedback for select
  using (auth.jwt()->>'email' = 'terrysc107@gmail.com');

grant all on spd.feedback to authenticated, service_role;
