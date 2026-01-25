export enum Role {
  ADMIN = 'ADMIN',
  SEGRETERIA = 'SEGRETERIA',
  ALLENATORE = 'ALLENATORE',
  ATLETA = 'ATLETA',
}

export interface User {
  id: string
  username: string
  email?: string | null
  roles: Role[]
  isActive: boolean
  member?: Member | null
  createdAt?: string
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  fiscalCode?: string
  dateOfBirth?: string
  phone?: string
  medicalCertExpiry?: string | null
  medicalCert?: MedicalCert | null
}

export interface MedicalCert {
  expiryDate: string
  certType: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterData {
  username: string
  email?: string
  password: string
  roles?: Role[]
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
