'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  checklists: 'Checklists',
  audits: 'Audits',
  findings: 'Findings',
  analytics: 'Analytics',
  import: 'Import Data',
  reports: 'Reports',
  settings: 'Settings',
  new: 'New',
  run: 'Run',
  results: 'Results',
  users: 'Users',
}

function toLabel(segment: string): string {
  return LABEL_MAP[segment.toLowerCase()] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => ({
    label: toLabel(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {i > 0 && (
            <span style={{ color: '#64748b', fontSize: '13px', userSelect: 'none' }}>›</span>
          )}
          {crumb.isLast ? (
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              style={{
                fontSize: '13px',
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 400,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#64748b' }}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
