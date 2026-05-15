import type { OrgConfig, OrgUser, UserRole } from '@/lib/types/org'

const STORAGE_KEY = 'spd_org'
const NOW = new Date().toISOString()

export const DEFAULT_ORG: OrgConfig = {
  orgName: 'Sterile Processing Department',
  departments: [
    { id: 'dept-1', name: 'Main SPD', code: 'SPD', createdAt: NOW },
  ],
  users: [
    {
      id: 'user-1',
      name: 'Current User',
      email: 'user@hospital.org',
      role: 'supervisor',
      departmentId: 'dept-1',
      createdAt: NOW,
    },
  ],
  updatedAt: NOW,
}

export function getOrgConfig(): OrgConfig {
  if (typeof window === 'undefined') return DEFAULT_ORG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OrgConfig) : DEFAULT_ORG
  } catch {
    return DEFAULT_ORG
  }
}

export function saveOrgConfig(config: OrgConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }))
  } catch {
    // localStorage quota exceeded — fail silently
  }
}

export function getCurrentUser(): OrgUser {
  return getOrgConfig().users[0] ?? DEFAULT_ORG.users[0]
}

export function getCurrentDepartmentId(): string {
  return getCurrentUser().departmentId
}

export function canViewAllDepartments(role: UserRole): boolean {
  return role === 'manager' || role === 'director' || role === 'qa'
}
