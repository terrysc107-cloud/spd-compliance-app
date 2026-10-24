// VENDORED from terrysc107-cloud/spd-twin@7ce67ee src/analysis.js by scripts/sync-twin.mjs. Do not edit.
// @ts-nocheck
/* ---------- Analysis helpers (pure, no DOM) ----------
   Shared by the timeline chart, tornado, histograms, and the sweep tool. Tested in Node. */
import { SIM_LEN, simulate, clone, mulberry32 } from './engine.js';
import { applyChanges } from './ai/schema.js';

// Per-minute count of washers and sterilizers (steam plus low-temp) running a cycle.
export function occupancy(R) {
  const wash = new Int16Array(SIM_LEN), ster = new Int16Array(SIM_LEN);
  const add = (arr, units) => { for (const u of units) for (const c of u.cycles) for (let m = c.s; m < Math.min(c.e, SIM_LEN); m++) arr[m]++; };
  add(wash, R.units.wash); add(ster, R.units.ster); add(ster, R.units.lt);
  return { wash, ster, nWash: R.units.wash.length, nSter: R.units.ster.length + R.units.lt.length };
}

// Clean axis ticks from 0 to at least max: 1, 2, 2.5, 5, 10 steps.
export function niceTicks(max, n = 4) {
  if (!(max > 0)) return [0, 1];
  const raw = max / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
  let step = 10 * p;
  for (const s of [1, 2, 2.5, 5, 10]) if (raw <= s * p) { step = s * p; break; }
  const out = [];
  for (let v = 0; v < max + step - 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

// Fixed-width bins starting at 0. Every value lands in exactly one bin.
export function histogram(values, binSize) {
  const max = values.length ? Math.max(...values) : 0, nb = Math.floor(max / binSize) + 1, bins = [];
  for (let i = 0; i < nb; i++) bins.push({ lo: i * binSize, hi: (i + 1) * binSize - 1, n: 0 });
  for (const v of values) bins[Math.floor(v / binSize)].n++;
  return bins;
}
// Named bins: edges [0,1,2,3] gives "0", "1", "2", "3+".
export function countBins(values, edges) {
  const bins = edges.map((e, i) => ({ label: i === edges.length - 1 ? `${e}+` : String(e), n: 0 }));
  for (const v of values) { let i = edges.length - 1; while (i > 0 && v < edges[i]) i--; bins[i].n++; }
  return bins;
}

// Lever results ranked by risk change, most improvement first. Levers that change nothing are dropped.
export function tornadoRows(LEV, limit = 12) {
  if (!LEV || !LEV.out) return [];
  return LEV.out.filter(x => x.dr !== 0).sort((a, b) => a.dr - b.dr || a.dt - b.dt).slice(0, limit)
    .map(x => ({ label: x.label, cost: x.cost, kind: x.kind, dr: x.dr, k: x.k, idx: LEV.out.indexOf(x) }));
}

// Values to run for a sweep: honors the item's step and range, thinned evenly past maxPoints.
export function sweepValues(item, from, to, maxPoints = 12) {
  const step = item.step || 1, dec = (String(step).split('.')[1] || '').length;
  let lo = Math.max(item.min, Math.min(from, to)), hi = Math.min(item.max, Math.max(from, to));
  lo = Math.ceil(lo / step - 1e-9) * step; hi = Math.floor(hi / step + 1e-9) * step;
  if (hi < lo) hi = lo;
  const n = Math.round((hi - lo) / step) + 1, out = [];
  if (n <= maxPoints) { for (let i = 0; i < n; i++) out.push(+(lo + i * step).toFixed(dec)); return out; }
  const seen = new Set();
  for (let i = 0; i < maxPoints; i++) { const idx = Math.round(i * (n - 1) / (maxPoints - 1)); if (!seen.has(idx)) { seen.add(idx); out.push(+(lo + idx * step).toFixed(dec)); } }
  return out;
}

// One varied day for the 100-day run. Lifted verbatim from runRisk; the golden test locks it.
export function varyDay(base, seed0, i) {
  const q = clone(base), r0 = mulberry32((seed0 * 7919 + i * 104729) >>> 0);
  q.seed = (seed0 * 131 + i * 7919 + 1) | 0; q.cases = Math.max(0, Math.round(base.cases * (0.85 + 0.3 * r0()))); q.loaners = Math.round(base.loaners * (0.7 + 0.6 * r0()));
  return q;
}

export function pctl(arr, q) { const b = [...arr].sort((x, y) => x - y); if (!b.length) return 0; return b[Math.min(b.length - 1, Math.floor(b.length * q))]; }

// One sweep point: the current seed at this value, plus an optional band over varied days.
export function sweepPoint(P, path, value, days = 0) {
  const q = applyChanges(P, [{ path, to: value }]);
  const k = simulate(q).k, out = { value, k, band: null };
  if (days > 0) {
    const ks = []; const seed0 = q.seed | 0;
    for (let i = 0; i < days; i++) ks.push(simulate(varyDay(q, seed0, i)).k);
    out.band = {};
    for (const key of ['firstMiss', 'statLate', 'backlog', 'avgTat']) { const a = ks.map(x => x[key]); out.band[key] = { p10: pctl(a, 0.1), med: pctl(a, 0.5), p90: pctl(a, 0.9) }; }
  }
  return out;
}
