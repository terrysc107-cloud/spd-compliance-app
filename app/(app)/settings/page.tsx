'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { Card, Badge, Button, Input } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getOrgConfig, saveOrgConfig, DEFAULT_ORG } from '@/lib/storage/org-storage'
import type { OrgConfig, Department, OrgUser, UserRole } from '@/lib/types/org'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

type Tab = 'organization' | 'team' | 'thresholds' | 'tools' | 'about'

const ROLES: UserRole[] = ['supervisor', 'manager', 'director', 'qa']

const roleVariant = (r: UserRole): 'info' | 'success' | 'warning' | 'default' => {
  if (r === 'director') return 'warning'
  if (r === 'manager')  return 'success'
  if (r === 'qa')       return 'info'
  return 'default'
}

const thresholds = [
  { label: 'Pass',     range: '90% and above', color: tokens.color.success },
  { label: 'Marginal', range: '70% – 89%',     color: '#f59e0b' },
  { label: 'Fail',     range: 'Below 70%',     color: tokens.color.danger },
]

// ─── STYLES ───────────────────────────────────────────────────────────────────

const muted: React.CSSProperties   = { color: tokens.color.textMuted, fontSize: 14 }
const h2Style: React.CSSProperties = { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: tokens.color.textPrimary }
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '10px 0', borderBottom: `1px solid ${tokens.color.border}`,
  flexWrap: 'wrap',
}
const selectStyle: React.CSSProperties = {
  background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, color: tokens.color.textPrimary,
  fontSize: 13, padding: '6px 10px', outline: 'none', cursor: 'pointer',
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'organization', label: 'Organization' },
    { id: 'team',         label: 'Team' },
    { id: 'thresholds',   label: 'Thresholds' },
    { id: 'tools',        label: 'Staffing Tools' },
    { id: 'about',        label: 'About' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24,
      borderBottom: `1px solid ${tokens.color.border}`, paddingBottom: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px 16px', fontSize: 14, fontWeight: 500,
          color: active === t.id ? tokens.color.accentBlue : tokens.color.textMuted,
          borderBottom: active === t.id ? `2px solid ${tokens.color.accentBlue}` : '2px solid transparent',
          marginBottom: -1, transition: 'color 0.15s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

// ─── ORG TAB ─────────────────────────────────────────────────────────────────

function OrgTab({ config, setConfig }: { config: OrgConfig; setConfig: (c: OrgConfig) => void }) {
  const [orgName, setOrgName] = useState(config.orgName)
  const [showAddDept, setShowAddDept] = useState(false)
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptCode, setNewDeptCode] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')

  function saveOrgName() {
    const updated = { ...config, orgName }
    setConfig(updated)
    saveOrgConfig(updated)
  }

  function addDepartment() {
    if (!newDeptName.trim() || !newDeptCode.trim()) return
    const dept: Department = {
      id: crypto.randomUUID(), name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(), createdAt: new Date().toISOString(),
    }
    const updated = { ...config, departments: [...config.departments, dept] }
    setConfig(updated); saveOrgConfig(updated)
    setNewDeptName(''); setNewDeptCode(''); setShowAddDept(false)
  }

  function deleteDepartment(id: string) {
    const updated = { ...config, departments: config.departments.filter(d => d.id !== id) }
    setConfig(updated); saveOrgConfig(updated)
  }

  function saveEdit(id: string) {
    const updated = {
      ...config,
      departments: config.departments.map(d =>
        d.id === id ? { ...d, name: editName.trim(), code: editCode.trim().toUpperCase() } : d
      ),
    }
    setConfig(updated); saveOrgConfig(updated); setEditId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card padding="md">
        <h2 style={h2Style}>Organization Name</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 480 }}>
          <div style={{ flex: 1 }}>
            <Input label="Name" value={orgName} onChange={e => setOrgName(e.target.value)} />
          </div>
          <Button size="sm" onClick={saveOrgName}>Save</Button>
        </div>
      </Card>

      <Card padding="md">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ ...h2Style, margin: 0 }}>Departments</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowAddDept(v => !v)}>
            {showAddDept ? 'Cancel' : 'Add Department'}
          </Button>
        </div>

        {showAddDept && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <Input label="Department Name" value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)} placeholder="e.g. OR Processing" />
            </div>
            <div style={{ width: 120 }}>
              <Input label="Code" value={newDeptCode}
                onChange={e => setNewDeptCode(e.target.value)} placeholder="e.g. OR-1" />
            </div>
            <Button size="sm" onClick={addDepartment}>Add</Button>
          </div>
        )}

        {config.departments.length === 0 ? (
          <p style={muted}>No departments yet.</p>
        ) : (
          config.departments.map(dept => (
            <div key={dept.id} style={rowStyle}>
              {editId === dept.id ? (
                <>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div style={{ width: 110 }}>
                    <Input value={editCode} onChange={e => setEditCode(e.target.value)} />
                  </div>
                  <Button size="sm" onClick={() => saveEdit(dept.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 14, color: tokens.color.textPrimary, fontWeight: 500 }}>
                    {dept.name}
                  </span>
                  <Badge variant="default" size="sm">{dept.code}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setEditId(dept.id); setEditName(dept.name); setEditCode(dept.code)
                  }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteDepartment(dept.id)}>Delete</Button>
                </>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  )
}

// ─── TEAM TAB ─────────────────────────────────────────────────────────────────

function TeamTab({ config, setConfig }: { config: OrgConfig; setConfig: (c: OrgConfig) => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('supervisor')
  const [newDept, setNewDept] = useState(config.departments[0]?.id ?? '')

  function addMember() {
    if (!newName.trim() || !newEmail.trim()) return
    const user: OrgUser = {
      id: crypto.randomUUID(), name: newName.trim(), email: newEmail.trim(),
      role: newRole, departmentId: newDept, createdAt: new Date().toISOString(),
    }
    const updated = { ...config, users: [...config.users, user] }
    setConfig(updated); saveOrgConfig(updated)
    setNewName(''); setNewEmail(''); setShowAdd(false)
  }

  function changeRole(userId: string, role: UserRole) {
    const updated = {
      ...config,
      users: config.users.map(u => u.id === userId ? { ...u, role } : u),
    }
    setConfig(updated); saveOrgConfig(updated)
  }

  function removeUser(userId: string) {
    const updated = { ...config, users: config.users.filter(u => u.id !== userId) }
    setConfig(updated); saveOrgConfig(updated)
  }

  const deptName = (id: string) => config.departments.find(d => d.id === id)?.name ?? id

  return (
    <Card padding="md">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ ...h2Style, margin: 0 }}>Team Members</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'Cancel' : 'Add Member'}
        </Button>
      </div>

      {showAdd && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 150, flex: 1 }}>
            <Input label="Name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div style={{ minWidth: 180, flex: 1 }}>
            <Input label="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@hospital.org" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: tokens.color.textMuted, marginBottom: 6 }}>Role</label>
            <select style={selectStyle} value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: tokens.color.textMuted, marginBottom: 6 }}>Department</label>
            <select style={selectStyle} value={newDept} onChange={e => setNewDept(e.target.value)}>
              {config.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Button size="sm" onClick={addMember}>Add</Button>
        </div>
      )}

      {config.users.length === 0 ? (
        <p style={muted}>No team members yet.</p>
      ) : (
        config.users.map((user, idx) => (
          <div key={user.id} style={{ ...rowStyle, borderBottom: idx < config.users.length - 1 ? `1px solid ${tokens.color.border}` : 'none' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: tokens.color.textPrimary }}>{user.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: tokens.color.textDimmed }}>{user.email}</p>
            </div>
            <Badge variant={roleVariant(user.role)} size="sm">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            <Badge variant="default" size="sm">{deptName(user.departmentId)}</Badge>
            <select style={selectStyle} value={user.role} onChange={e => changeRole(user.id, e.target.value as UserRole)}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            {idx > 0 && (
              <Button size="sm" variant="danger" onClick={() => removeUser(user.id)}>Remove</Button>
            )}
          </div>
        ))
      )}
    </Card>
  )
}

// ─── THRESHOLDS TAB ───────────────────────────────────────────────────────────

function ThresholdsTab() {
  return (
    <Card padding="md">
      <h2 style={h2Style}>Compliance Thresholds</h2>
      <p style={{ ...muted, marginTop: 0, marginBottom: 20, fontSize: 13 }}>
        These thresholds determine how audit scores are classified.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {thresholds.map(({ label, range, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.color.border}`,
            borderRadius: tokens.radius.sm, padding: '12px 16px',
          }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: tokens.color.textPrimary, fontWeight: 500, minWidth: 70 }}>{label}</span>
            <span style={muted}>{range}</span>
          </div>
        ))}
      </div>
      <p style={{ ...muted, fontSize: 12, marginTop: 16, marginBottom: 0 }}>
        Custom threshold editing available in Phase 08.
      </p>
    </Card>
  )
}

// ─── TOOLS TAB ────────────────────────────────────────────────────────────────

const toolLinkStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 16, padding: '16px', textDecoration: 'none',
  background: 'rgba(255,255,255,0.02)', border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.md, transition: 'border-color 0.15s, background 0.15s',
}

function ToolsTab() {
  return (
    <Card padding="md">
      <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: tokens.color.textPrimary }}>
        Staffing Tools
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: tokens.color.textMuted }}>
        Capacity planning utilities to help you match staff levels to surgical volume.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/settings/staffing" style={toolLinkStyle}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: tokens.color.textPrimary }}>
              Staffing Calculator
            </p>
            <p style={{ margin: 0, fontSize: 13, color: tokens.color.textMuted }}>
              Estimate FTE coverage ratio against daily case volume and instrument load.
            </p>
          </div>
          <span style={{ fontSize: 18, color: tokens.color.textDimmed, flexShrink: 0 }}>→</span>
        </Link>
        <Link href="/settings/schedule" style={toolLinkStyle}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: tokens.color.textPrimary }}>
              Smart Scheduler
            </p>
            <p style={{ margin: 0, fontSize: 13, color: tokens.color.textMuted }}>
              Analyze day-by-day staffing gaps across the full week and get risk recommendations.
            </p>
          </div>
          <span style={{ fontSize: 18, color: tokens.color.textDimmed, flexShrink: 0 }}>→</span>
        </Link>
      </div>
    </Card>
  )
}

// ─── ABOUT TAB ────────────────────────────────────────────────────────────────

function AboutTab() {
  return (
    <Card padding="md">
      <h2 style={h2Style}>About</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'App', value: 'SPD Compliance Intelligence' },
          { label: 'Version', value: '0.7.0' },
          { label: 'Phase', value: 'Phase 07 — Org & Department Structure' },
          { label: 'Storage', value: 'Local (browser localStorage)' },
          { label: 'Auth', value: 'Phase 08 (planned)' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', gap: 16, fontSize: 14, padding: '6px 0',
            borderBottom: `1px solid ${tokens.color.border}` }}>
            <span style={{ color: tokens.color.textMuted, minWidth: 100 }}>{label}</span>
            <span style={{ color: tokens.color.textPrimary }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab]       = useState<Tab>('organization')
  const [config, setConfig] = useState<OrgConfig>(DEFAULT_ORG)

  useEffect(() => { setConfig(getOrgConfig()) }, [])

  return (
    <PageShell title="Settings" description="Manage your organization, team, and compliance configuration.">
      <TabBar active={tab} onChange={setTab} />
      {tab === 'organization' && <OrgTab config={config} setConfig={setConfig} />}
      {tab === 'team'         && <TeamTab config={config} setConfig={setConfig} />}
      {tab === 'thresholds'   && <ThresholdsTab />}
      {tab === 'tools'        && <ToolsTab />}
      {tab === 'about'        && <AboutTab />}
    </PageShell>
  )
}
