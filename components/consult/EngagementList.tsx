'use client'

import Link from 'next/link'
import { Card } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { ENGAGEMENT_TYPE_LABEL, STATUS_LABEL } from '@/lib/consult/framework'
import { Pill, fmtDay } from '@/components/consult/fields'
import type { Engagement, EngagementStatus } from '@/lib/consult/types'

export const STATUS_COLOR: Record<EngagementStatus, string> = {
  planned: '#94a3b8', 'on-site': '#3b82f6', drafting: '#eab308', delivered: '#22c55e',
}

export default function EngagementList({ items }: { items: Engagement[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(e => (
        <Link key={e.id} href={`/consult/engagements/${e.id}`} style={{ textDecoration: 'none' }}>
          <Card padding="md" hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary }}>{e.title}</div>
                <div style={{ fontSize: 13, color: tokens.color.textMuted, marginTop: 3 }}>
                  {e.clientName ?? 'Client'} · {ENGAGEMENT_TYPE_LABEL[e.type]} · {fmtDay(e.visitStart)}
                </div>
              </div>
              <Pill color={STATUS_COLOR[e.status]}>{STATUS_LABEL[e.status]}</Pill>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
