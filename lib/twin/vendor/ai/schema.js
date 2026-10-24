// VENDORED from terrysc107-cloud/spd-twin@7ce67ee src/ai/schema.js by scripts/sync-twin.mjs. Do not edit.
// @ts-nocheck
/* ---------- Editable-input schema (pure, no DOM) ----------
   The only inputs the AI may change, with ranges. Shared by the browser (preview) and the
   server (validation after Claude replies). Nothing outside EDITABLE is ever applied. */
import { clone } from '../engine.js';
import { SECTIONS } from '../ui/presets.js';

export const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0') + ':00');
const SHIFT_IDS = ['day', 'mid', 'eve', 'night'];
const SHIFT_LABEL = { day: 'Day', mid: 'Mid', eve: 'Evening', night: 'Night' };
const EQUIP = ['none', 'wash', 'ster', 'lt'];
const EQUIP_LABEL = { none: 'none', wash: 'washer', ster: 'steam sterilizer', lt: 'low-temp' };
const FLEET = { wash: 'washers', ster: 'sterilizers', lt: 'lowTemp' };

// Build the allowlist. SECTIONS supplies the numeric and time inputs with their labels and ranges.
function build() {
  const E = [];
  for (const s of SECTIONS) if (s.items) for (const it of s.items) {
    if (it.type === 'time') E.push({ path: it.k, label: it.label, kind: 'time' });
    else E.push({ path: it.k, label: it.label, kind: 'number', min: it.min, max: it.max, step: it.step, unit: it.unit || '' });
  }
  for (const role of ['decon', 'prep']) for (const sh of SHIFT_IDS)
    E.push({ path: `staff.${role}.${sh}`, label: `${SHIFT_LABEL[sh]} ${role === 'prep' ? 'prep and pack' : 'decon'} techs`, kind: 'number', min: 0, max: 5, step: 1, unit: '' });
  for (const sh of SHIFT_IDS) {
    E.push({ path: `shifts.${sh}.start`, label: `${SHIFT_LABEL[sh]} shift start`, kind: 'time' });
    E.push({ path: `shifts.${sh}.hours`, label: `${SHIFT_LABEL[sh]} shift length`, kind: 'number', min: 4, max: 12, step: 0.5, unit: 'hr' });
  }
  E.push({ path: 'down', label: 'Downtime event', kind: 'object', fields: { equip: EQUIP, unit: [1, 6], start: 'time', hours: [1, 16] } });
  E.push({ path: 'down.equip', label: 'Downtime equipment', kind: 'enum', values: EQUIP });
  E.push({ path: 'down.unit', label: 'Downtime unit number', kind: 'number', min: 1, max: 6, step: 1, unit: '' });
  E.push({ path: 'down.start', label: 'Downtime starts', kind: 'time' });
  E.push({ path: 'down.hours', label: 'Downtime length', kind: 'number', min: 1, max: 16, step: 1, unit: 'hr' });
  return E;
}
export const EDITABLE = build();
const BY_PATH = new Map(EDITABLE.map(e => [e.path, e]));

// Current value at a dotted path. Shift paths use the shift id, not the array index.
export function getAt(P, path) {
  const parts = path.split('.');
  let o = P;
  for (let i = 0; i < parts.length; i++) {
    if (o == null) return undefined;
    if (parts[i - 1] === 'shifts' && Array.isArray(o)) o = o.find(s => s.id === parts[i]);
    else o = o[parts[i]];
  }
  return o;
}
function setAt(P, path, v) {
  const parts = path.split('.');
  let o = P;
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i - 1] === 'shifts' && Array.isArray(o)) o = o.find(s => s.id === parts[i]);
    else o = o[parts[i]];
  }
  o[parts[parts.length - 1]] = v;
}

const roundStep = (v, step) => Math.round(v / step) * step;
const fmtNum = v => Math.round(v * 100) / 100;

function clampNumber(e, raw, out) {
  const n = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof n !== 'number' || !Number.isFinite(n)) return { err: 'needs a number' };
  let v = fmtNum(roundStep(n, e.step));
  let note = '';
  if (v < e.min) { v = e.min; note = `clamped to min ${e.min}`; }
  if (v > e.max) { v = e.max; note = `clamped to max ${e.max}`; }
  if (!note && Math.abs(v - n) > 1e-9) note = `rounded to the nearest ${e.step}`;
  return { v, note };
}
function snapTime(raw) {
  if (typeof raw !== 'string') return { err: 'needs a clock time like 13:00' };
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return { err: 'needs a clock time like 13:00' };
  let h = +m[1], mi = m[2] ? +m[2] : 0;
  if (m[3]) { const pm = m[3].toLowerCase() === 'pm'; if (h === 12) h = pm ? 12 : 0; else if (pm) h += 12; }
  if (h > 23 || mi > 59) return { err: 'needs a clock time like 13:00' };
  const snapped = (h + (mi >= 30 ? 1 : 0)) % 24;
  const v = String(snapped).padStart(2, '0') + ':00';
  return { v, note: mi ? `snapped to ${v}` : '' };
}

// Validate a list of {path, to}. Returns what will be applied, what was refused, and what was already so.
export function validateChanges(P, changes) {
  const ok = [], rejected = [], unchanged = [];
  if (!Array.isArray(changes)) return { ok, rejected: [{ path: '(all)', reason: 'changes must be a list' }], unchanged };
  // Expand a whole downtime object into its four fields so every change is one leaf.
  const flat = [];
  for (const c of changes) {
    if (!c || typeof c.path !== 'string') { rejected.push({ path: String(c && c.path), reason: 'not an input' }); continue; }
    if (c.path === 'down' && c.to && typeof c.to === 'object') { for (const f of ['equip', 'unit', 'start', 'hours']) if (c.to[f] !== undefined) flat.push({ path: 'down.' + f, to: c.to[f] }); }
    else flat.push(c);
  }
  const Q = clone(P);
  for (const c of flat) {
    const e = BY_PATH.get(c.path);
    if (!e || e.kind === 'object') { rejected.push({ path: c.path, reason: 'not an input the sim exposes' }); continue; }
    const from = getAt(Q, c.path);
    let r;
    if (e.kind === 'number') r = clampNumber(e, c.to, ok);
    else if (e.kind === 'time') r = snapTime(c.to);
    else if (e.kind === 'enum') { const v = String(c.to).toLowerCase(); r = e.values.includes(v) ? { v, note: '' } : { err: `must be one of ${e.values.join(', ')}` }; }
    if (r.err) { rejected.push({ path: c.path, reason: r.err }); continue; }
    let { v, note } = r;
    if (c.path === 'down.unit') { const eq = getAt(Q, 'down.equip'), fleet = FLEET[eq] ? Q[FLEET[eq]] : 6; if (v > Math.max(1, fleet)) { v = Math.max(1, fleet); note = `only ${v} ${EQUIP_LABEL[eq] || 'unit'}${v === 1 ? '' : 's'} exist`; } }
    if (v === from) { unchanged.push({ path: c.path, label: e.label, value: fmtEdit(e, v) }); continue; }
    setAt(Q, c.path, v);
    ok.push({ path: c.path, label: e.label, from, to: v, note });
  }
  // A unit set before its equipment was switched can now exceed the new fleet. Re-cap.
  const u = ok.find(x => x.path === 'down.unit'), eqc = ok.find(x => x.path === 'down.equip');
  if (eqc && !u) { const eq = eqc.to, fleet = FLEET[eq] ? Q[FLEET[eq]] : 6; if (Q.down.unit > Math.max(1, fleet)) { setAt(Q, 'down.unit', 1); ok.push({ path: 'down.unit', label: 'Downtime unit number', from: P.down.unit, to: 1, note: 'reset to unit 1' }); } }
  return { ok, rejected, unchanged };
}

export function applyChanges(P, ok) {
  const Q = clone(P);
  for (const c of ok) setAt(Q, c.path, c.to);
  return Q;
}

function fmtEdit(e, v) {
  if (e.kind === 'enum') return EQUIP_LABEL[v] || String(v);
  if (e.kind === 'number' && e.unit) return `${v} ${e.unit === '%' ? '%' : e.unit}`.replace(' %', '%');
  return String(v);
}

// Plain lines for the proposal card. Any downtime field change renders as the full resulting event,
// so P (the inputs before the change) is needed to fill in the fields that did not move.
export function describeChanges(ok, P) {
  const lines = [], down = [];
  for (const c of ok) {
    if (c.path.startsWith('down.')) { down.push(c); continue; }
    const e = BY_PATH.get(c.path);
    lines.push(`${c.label}: ${fmtEdit(e, c.from)} to ${fmtEdit(e, c.to)}${c.note ? ` (${c.note})` : ''}`);
  }
  if (down.length) {
    const d = applyChanges(P, down).down, notes = down.filter(x => x.note).map(x => x.note);
    if (d.equip === 'none') lines.push('Downtime: removed');
    else lines.push(`Downtime: ${EQUIP_LABEL[d.equip]} ${d.unit} from ${d.start} for ${d.hours} hour${d.hours === 1 ? '' : 's'}${notes.length ? ` (${notes.join('; ')})` : ''}`);
  }
  return lines;
}

// Compact allowlist for the system prompt: one line per input with its range and current value.
export function describeAllowlist(P) {
  return EDITABLE.filter(e => e.kind !== 'object').map(e => {
    const cur = getAt(P, e.path);
    const range = e.kind === 'number' ? `${e.min} to ${e.max}${e.unit ? ' ' + e.unit : ''}, step ${e.step}` : e.kind === 'time' ? 'clock time on the hour, HH:00' : e.values.join(' | ');
    return `${e.path} | ${e.label} | ${range} | now ${cur}`;
  }).join('\n');
}
