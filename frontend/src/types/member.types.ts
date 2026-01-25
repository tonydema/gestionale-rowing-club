import type { Role } from './auth.types'

// Categorie di età per il canottaggio (calcolate automaticamente dalla data di nascita)
export enum AgeCategory {
  ALLIEVI_A = 'ALLIEVI_A',           // 10 anni
  ALLIEVI_B = 'ALLIEVI_B',           // 11-12 anni
  ALLIEVI_C = 'ALLIEVI_C',           // 13 anni
  CADETTI = 'CADETTI',               // 14 anni
  UNDER_17 = 'UNDER_17',             // 15-16 anni (ex Ragazzi)
  UNDER_19 = 'UNDER_19',             // 17-18 anni (Junior)
  UNDER_23 = 'UNDER_23',             // 19-22 anni
  SENIOR = 'SENIOR',                 // 23-26 anni
  SENIOR_MASTER = 'SENIOR_MASTER',   // 27+ anni
}

export interface MedicalCertificate {
  id: string
  issueDate: string
  expiryDate: string
  certType: string
  doctorName: string
  notes?: string
}

export interface Member {
  id: string
  userId: string
  firstName: string
  lastName: string
  fiscalCode: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  city: string
  postalCode: string
  phone?: string
  photoUrl?: string | null
  groupId?: string | null
  membershipDate: string
  medicalCertExpiry?: string | null
  isActive: boolean
  user?: {
    id: string
    username: string
    email?: string | null
    roles: Role[]
    isActive: boolean
  }
  group?: {
    id: string
    name: string
  } | null
  medicalCert?: MedicalCertificate | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateMemberDto {
  username: string
  email?: string
  password: string
  firstName: string
  lastName: string
  fiscalCode: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  city: string
  postalCode: string
  phone?: string
  groupId?: string
  medicalCertExpiry?: string
  roles?: Role[]
}

export interface UpdateMemberDto {
  username?: string
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  fiscalCode?: string
  dateOfBirth?: string
  placeOfBirth?: string
  address?: string
  city?: string
  postalCode?: string
  phone?: string
  groupId?: string | null
  medicalCertExpiry?: string
  isActive?: boolean
  roles?: Role[]
}

export interface QueryMembersDto {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  category?: AgeCategory
}

export interface MembersListResponse {
  data: Member[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
