/**
 * Light theme tokens — SCOPED TO THE MARKETING LANDING PAGE ONLY.
 *
 * The authenticated app (app/(app)/**) and globals.css remain dark. This file
 * exists so the public landing page can render a clean, clinical light look
 * without mutating the global dark `design-tokens.ts` the rest of the app
 * depends on. Do not import these tokens inside the app shell.
 */
export const landing = {
  color: {
    // Canvas
    bg:          '#ffffff',
    band:        '#f6f8fb', // alternating soft gray-blue section background
    bandBorder:  '#eef2f7',

    // Surfaces
    card:        '#ffffff',
    cardSubtle:  '#f9fbfd',

    // Ink
    heading:     '#0b1524',
    body:        '#475569',
    muted:       '#64748b',

    // Single accent + supporting semantic colors
    accent:      '#2563eb', // trust-blue (deeper than the app's #3b82f6 for white bg)
    accentSoft:  '#eff4ff', // accent tint for pills / chips
    accentBorder:'#cfe0ff',
    success:     '#16a34a', // "Survey Ready" only
    successSoft: '#e9f7ef',
    warning:     '#d97706',
    danger:      '#dc2626',

    // Lines
    border:      '#e6ebf2',
    borderStrong:'#d6deea',
  },
  radius: {
    sm:   '8px',
    md:   '12px',
    lg:   '16px',
    xl:   '24px',
    pill: '999px',
  },
  shadow: {
    sm:   '0 1px 2px rgba(16,24,40,0.05)',
    card: '0 1px 2px rgba(16,24,40,0.04), 0 12px 28px rgba(16,24,40,0.06)',
    lift: '0 2px 4px rgba(16,24,40,0.06), 0 18px 40px rgba(16,24,40,0.10)',
  },
} as const
