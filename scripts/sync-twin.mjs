// Copies SPD Twin's pure engine modules into lib/twin/vendor, verbatim, with
// a provenance header. The engine is owned by the spd-twin repo (its golden
// test is the contract); this app only consumes it. Never edit the vendored
// files by hand — change spd-twin, then re-run:
//
//   node scripts/sync-twin.mjs /path/to/spd-twin
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const src = process.argv[2]
if (!src) { console.error('usage: node scripts/sync-twin.mjs /path/to/spd-twin'); process.exit(1) }
const commit = execSync('git rev-parse --short HEAD', { cwd: src }).toString().trim()
const FILES = ['src/engine.js', 'src/codec.js', 'src/analysis.js', 'src/ai/schema.js', 'src/ui/presets.js']
const out = join(process.cwd(), 'lib/twin/vendor')
for (const f of FILES) {
  const dest = join(out, f.replace(/^src\//, ''))
  mkdirSync(dirname(dest), { recursive: true })
  const header = `// VENDORED from terrysc107-cloud/spd-twin@${commit} ${f} by scripts/sync-twin.mjs. Do not edit.\n// @ts-nocheck\n`
  writeFileSync(dest, header + readFileSync(join(src, f), 'utf8'))
}
writeFileSync(join(out, 'VERSION'), `${commit}\n`)
console.log(`vendored ${FILES.length} files from spd-twin@${commit}`)
