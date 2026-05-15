'use client'

import React, { useState } from 'react'
import { tokens } from '@/lib/constants/design-tokens'

type Padding = 'sm' | 'md' | 'lg'

interface CardProps {
  children:  React.ReactNode
  padding?:  Padding
  hoverable?: boolean
  onClick?:  () => void
}

const paddingMap: Record<Padding, string> = {
  sm: '12px',
  md: '20px',
  lg: '28px',
}

export function Card({ children, padding = 'md', hoverable = false, onClick }: CardProps) {
  const [hovered, setHovered] = useState(false)

  const style: React.CSSProperties = {
    background:   hovered && hoverable ? tokens.color.surfaceHover : tokens.color.surface,
    border:       `1px solid ${hovered && hoverable ? tokens.color.borderHover : tokens.color.border}`,
    borderRadius: tokens.radius.lg,
    padding:      paddingMap[padding],
    boxShadow:    tokens.shadow.card,
    cursor:       onClick ? 'pointer' : 'default',
    transition:   'background 0.15s, border-color 0.15s',
  }

  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}
