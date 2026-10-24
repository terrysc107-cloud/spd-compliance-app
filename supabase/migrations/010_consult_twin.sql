-- SPD Twin scenarios per engagement: {current, ideal}, each a compact diff
-- against the Twin engine's DEFAULTS (lib/twin/vendor/codec.js). Validated
-- through Twin's input allowlist on every load, so a bad value can't reach
-- the engine even if this column is edited by hand.
set search_path = spd, public, extensions;
alter table spd.consult_engagements add column twin jsonb;
