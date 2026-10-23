-- Voice copilot: observations captured by voice are tagged and flagged for
-- review, so nothing misheard reaches a client report unread. Editing the
-- observation in the app (or pressing "Reviewed") clears the flag.
set search_path = spd, public, extensions;

alter table spd.consult_observations drop constraint if exists consult_observations_source_check;
alter table spd.consult_observations add constraint consult_observations_source_check
  check (source in ('walkthrough','field','library','voice'));

alter table spd.consult_observations add column needs_review boolean not null default false;
