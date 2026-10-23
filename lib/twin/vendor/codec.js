// VENDORED from terrysc107-cloud/spd-twin@7ce67ee src/codec.js by scripts/sync-twin.mjs. Do not edit.
// @ts-nocheck
/* ---------- Scenario codec (pure, no DOM) ----------
   Turns inputs into a compact diff against DEFAULTS and back, for share links and saved scenarios.
   Everything that comes back from a link is validated through the same allowlist the AI uses. */
import { DEFAULTS, clone } from './engine.js';
import { validateChanges, applyChanges } from './ai/schema.js';

// Only the leaves that differ from DEFAULTS, keyed by dotted path. Seed is always included.
export function diffParams(P) {
  const d = {};
  for (const k of Object.keys(DEFAULTS)) {
    if (k === 'seed') continue;
    if (k === 'staff') { for (const role of Object.keys(DEFAULTS.staff)) for (const sh of Object.keys(DEFAULTS.staff[role])) { const v = P.staff?.[role]?.[sh]; if (v !== undefined && v !== DEFAULTS.staff[role][sh]) d[`staff.${role}.${sh}`] = v; } }
    else if (k === 'shifts') { for (const s of DEFAULTS.shifts) { const ps = (P.shifts || []).find(x => x.id === s.id); if (ps) for (const f of ['start', 'hours']) if (ps[f] !== s[f]) d[`shifts.${s.id}.${f}`] = ps[f]; } }
    else if (k === 'down') { for (const f of ['equip', 'unit', 'start', 'hours']) { const v = P.down?.[f]; if (v !== undefined && v !== DEFAULTS.down[f]) d['down.' + f] = v; } }
    else if (P[k] !== undefined && P[k] !== DEFAULTS[k]) d[k] = P[k];
  }
  d.seed = Number.isInteger(P.seed) ? P.seed : DEFAULTS.seed;
  return d;
}

// Rebuild full inputs from a diff. Unknown keys and bad values are refused or clamped by validateChanges.
export function mergeParams(diff) {
  const changes = Object.entries(diff || {}).filter(([k]) => k !== 'seed').map(([path, to]) => ({ path, to }));
  const { ok, rejected } = validateChanges(clone(DEFAULTS), changes);
  const p = applyChanges(clone(DEFAULTS), ok);
  const seed = Number(diff && diff.seed);
  p.seed = Number.isInteger(seed) ? seed : DEFAULTS.seed;
  return { p, applied: ok.length, rejected };
}

const b64url = s => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = s => atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4));
export function encodeShare(diff) { return b64url(JSON.stringify(diff)); }
export function decodeShare(str) {
  try { const o = JSON.parse(unb64url(String(str || '').trim())); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch { return null; }
}
// Full round trip for a link: null when the string is not a scenario.
export function fromShare(str) { const d = decodeShare(str); return d ? mergeParams(d) : null; }
