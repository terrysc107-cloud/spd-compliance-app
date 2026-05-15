// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface StaffingInput {
  fteCount: number
  hoursPerShift: number
  shiftsPerWeek: number
  caseVolumePerDay: number
  instrumentsPerCase: number
  minutesPerTray: number
}

export interface StaffingResult {
  availableMinutesPerDay: number
  requiredMinutesPerDay: number
  coverageRatio: number
  status: 'adequate' | 'marginal' | 'understaffed'
  statusLabel: string
  recommendation: string
  staffingGap: number
}

export interface ScheduleInput {
  weeklyPattern: Array<{
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
    caseVolume: number
    staffAvailable: number
  }>
  minutesPerTray: number
  instrumentsPerCase: number
}

export interface ScheduleDay {
  day: string
  caseVolume: number
  staffAvailable: number
  requiredStaff: number
  variance: number
  status: 'adequate' | 'marginal' | 'understaffed'
}

// ─── FUNCTIONS ────────────────────────────────────────────────────────────────

export function calculateStaffing(input: StaffingInput): StaffingResult {
  const { fteCount, hoursPerShift, shiftsPerWeek, caseVolumePerDay, instrumentsPerCase, minutesPerTray } = input

  const availableMinutesPerDay = (fteCount * hoursPerShift * 60 * shiftsPerWeek) / 5
  const requiredMinutesPerDay  = caseVolumePerDay * instrumentsPerCase * minutesPerTray
  const coverageRatio          = availableMinutesPerDay / (requiredMinutesPerDay || 1)

  const status: StaffingResult['status'] =
    coverageRatio >= 1.1 ? 'adequate' :
    coverageRatio >= 0.9 ? 'marginal' :
    'understaffed'

  const statusLabel = status === 'adequate' ? 'Adequate' : status === 'marginal' ? 'Marginal' : 'Understaffed'

  const recommendation =
    status === 'adequate'
      ? 'Current staffing covers projected workload with a comfortable buffer.'
      : status === 'marginal'
      ? 'Staffing is near capacity. Consider cross-training or flexible scheduling.'
      : 'Staffing is insufficient. Recruit additional FTEs or reduce case volume.'

  const staffingGap =
    status === 'adequate' ? 0 :
    Math.max(0, Math.ceil((requiredMinutesPerDay - availableMinutesPerDay) / (hoursPerShift * 60)))

  return { availableMinutesPerDay, requiredMinutesPerDay, coverageRatio, status, statusLabel, recommendation, staffingGap }
}

export function analyzeSchedule(input: ScheduleInput): ScheduleDay[] {
  const { weeklyPattern, minutesPerTray, instrumentsPerCase } = input
  const DEFAULT_SHIFT_HOURS = 8

  return weeklyPattern.map(({ day, caseVolume, staffAvailable }) => {
    const requiredMinutes = caseVolume * instrumentsPerCase * minutesPerTray
    const requiredStaff   = Math.ceil(requiredMinutes / (DEFAULT_SHIFT_HOURS * 60))
    const variance        = staffAvailable - requiredStaff

    const status: ScheduleDay['status'] =
      variance >= 1  ? 'adequate' :
      variance === 0 ? 'marginal' :
      'understaffed'

    return { day, caseVolume, staffAvailable, requiredStaff, variance, status }
  })
}
