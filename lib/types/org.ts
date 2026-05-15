export type UserRole = 'supervisor' | 'manager' | 'director' | 'qa'

export interface Department {
  id: string
  name: string
  code: string       // short code e.g. "SPD-A", "SPD-B"
  createdAt: string
}

export interface OrgUser {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId: string
  createdAt: string
}

export interface OrgConfig {
  orgName: string
  departments: Department[]
  users: OrgUser[]
  updatedAt: string
}
