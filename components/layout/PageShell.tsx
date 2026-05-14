'use client'

import Breadcrumb from './Breadcrumb'

interface PageShellProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export default function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <Breadcrumb />
      </div>

      {/* Page header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {description && (
            <p style={{
              margin: '6px 0 0',
              fontSize: '14px',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
