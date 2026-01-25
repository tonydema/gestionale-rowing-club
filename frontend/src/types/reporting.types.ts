// Types per il modulo Rendicontazione

export interface ReportTypeConfig {
  id: string
  name: string
  description?: string
  price?: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportAthlete {
  id: string
  reportId: string
  memberId: string
  member: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface Report {
  id: string
  description: string
  date: string // ISO date string
  reportTypeId?: string
  reportType?: ReportTypeConfig
  compensation?: number
  coachId: string
  coach: {
    id: string
    username: string
    member?: {
      firstName: string
      lastName: string
    }
  }
  athletes: ReportAthlete[]
  createdAt: string
  updatedAt: string
}

export interface CreateReportDto {
  description: string
  date: string
  reportTypeId?: string
  compensation?: number
  coachId?: string // Solo per admin/segreteria
  athleteIds?: string[]
}

export interface UpdateReportDto {
  description?: string
  date?: string
  reportTypeId?: string
  compensation?: number
  coachId?: string
  athleteIds?: string[]
}

export interface ReportFilters {
  coachId?: string
  reportTypeId?: string
  startDate?: string
  endDate?: string
}

export interface ReportListResponse {
  data: Report[]
  total: number
  page: number
  limit: number
}

export interface CreateReportTypeDto {
  name: string
  description?: string
  price?: number
  isEnabled?: boolean
}

export interface UpdateReportTypeDto {
  name?: string
  description?: string
  price?: number
  isEnabled?: boolean
}
