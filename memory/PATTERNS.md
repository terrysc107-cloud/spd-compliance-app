# Patterns

## Phase Execution Pattern (Masterbuilder Standard)

For every phase, follow this sequence exactly:

```
1. Read memory/DECISIONS.md + memory/LEARNINGS.md (always, no exceptions)
2. Spawn lead agent (named, background: true)
3. Spawn support agents in same message (named, background: true)
4. STOP — wait for all agent completion notifications
5. Spawn Verifier agent — reviews outputs against phase Definition of Done
6. If Verifier PASSES: commit + push, update phase status in DECISIONS.md, start next phase
7. If Verifier FINDS GAPS: spawn fix agents, re-verify (max 2 retry loops)
8. Learning Steward writes to memory/LEARNINGS.md after every phase
```

## Agent Naming Convention

```
lead-phaseNN       e.g. lead-phase02
support-phaseNN-a  e.g. support-phase03-a
verifier-phaseNN   e.g. verifier-phase03
```

## Commit Pattern Per Phase

```bash
git add -A
git commit -m "feat(phaseNN): <description>\n\nhttps://claude.ai/code/session_01BzcD7Kbr9RdSJde89PsvGC"
git push -u origin claude/setup-compliance-app-ogzKb
```

Never commit .env files. Never commit node_modules.

## File Size Rule

No file may exceed 500 lines. If a file approaches 400 lines, split it before adding more.

## Tech Stack (confirmed, do not deviate)

- Next.js App Router (already installed)
- Supabase (auth + database + storage) — install in Phase 08
- Vercel AI SDK v6 (already installed, route at /api/generate-report)
- TypeScript strict mode (already configured)
- Recharts — install in Phase 03 for analytics
- pnpm as package manager

## Design System (do not change without Design Auditor approval)

```
Background:    #05091a
Accent blue:   #3b82f6
Accent indigo: #6366f1
Accent purple: #a78bfa
Text primary:  #ffffff
Text muted:    #94a3b8
Danger:        #ef4444
Warning:       #eab308
Success:       #22c55e
Border:        rgba(255,255,255,0.08)
Radius sm:     8px | md: 12px | lg: 16px | xl: 20px | pill: 99px
```

## Data Model (9 core entities — do not add without phase contract)

Org → User, Checklist, Audit, Report, ImportedDataset
Checklist → ChecklistItem, Audit
Audit → AuditResponse, Finding
Finding → corrective action fields (on Finding itself)

## Phase Status Tracking

After each phase completes, update DECISIONS.md "### Phase Status" section:
- IN PROGRESS → COMPLETE with date
- Add next phase as IN PROGRESS
