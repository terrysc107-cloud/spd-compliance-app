'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getMyProfile, getMyEmail } from '@/lib/db/org'
import type { MyProfile } from '@/lib/db/types'

const OWNER_EMAIL = 'terrysc107@gmail.com'

const icon = (paths: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
)

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: icon(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>) },
  { label: 'Audits', href: '/audits', icon: icon(<><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>) },
  { label: 'Checklists', href: '/checklists', icon: icon(<><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></>) },
  { label: 'Corrective Actions', href: '/findings', icon: icon(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>) },
  { label: 'Analytics', href: '/analytics', icon: icon(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>) },
  { label: 'Reports', href: '/reports', icon: icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>) },
]

// Secondary "Tools" group (staffing calculator + scheduler live under settings).
const TOOLS_ITEMS = [
  { label: 'Staffing', href: '/settings/staffing' },
  { label: 'Scheduler', href: '/settings/schedule' },
  { label: 'Thresholds', href: '/settings/thresholds' },
  { label: 'Settings', href: '/settings' },
]

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ROLE_LABEL: Record<string, string> = {
  supervisor: 'Supervisor', manager: 'Manager', director: 'Director', qa: 'QA',
}

export default function Sidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    getMyProfile().then(setProfile).catch(() => {})
    getMyEmail().then(e => setIsOwner(e === OWNER_EMAIL)).catch(() => {})
  }, [])

  const navItems = isOwner ? [...NAV_ITEMS, { label: 'Admin', href: '/admin', icon: icon(<><circle cx="12" cy="12" r="3" /><path d="M12 1v6M12 17v6M4.2 4.2l4.3 4.3M15.5 15.5l4.3 4.3M1 12h6M17 12h6" /></>) }] : NAV_ITEMS

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px',
    borderRadius: '8px', marginBottom: '2px', textDecoration: 'none', fontSize: '14px',
    fontWeight: active ? 600 : 400, color: active ? '#ffffff' : '#94a3b8',
    background: active ? '#3b82f6' : 'transparent', transition: 'background 0.15s ease, color 0.15s ease',
  })

  const name = profile?.name ?? 'Your account'
  const roleLabel = profile ? (ROLE_LABEL[profile.role] ?? profile.role) : 'Loading…'
  const initial = (profile?.name?.trim()?.[0] ?? 'S').toUpperCase()

  return (
    <aside style={{ width: '240px', minWidth: '240px', height: '100vh', position: 'sticky', top: 0, background: '#0d1529', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldIcon />
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>SPD Intel</span>
        <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', color: '#a5b4fc', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 999, padding: '2px 6px' }}>
          BETA
        </span>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={linkStyle(active)}>
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div style={{ margin: '14px 12px 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569' }}>
          Tools
        </div>
        {TOOLS_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ ...linkStyle(active), fontSize: '13px', padding: '7px 12px' }}>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User / role badge (real profile) */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(99,102,241,0.12)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#ffffff', flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
