import api from './api'
import type {
  Report,
  CreateReportDto,
  UpdateReportDto,
  ReportFilters,
  ReportListResponse,
} from '@/types/reporting.types'

export const reportingService = {
  /**
   * Ottiene la lista delle rendicontazioni con filtri
   */
  async getReports(params?: {
    page?: number
    limit?: number
    filters?: ReportFilters
  }): Promise<ReportListResponse> {
    const queryParams = {
      page: params?.page,
      limit: params?.limit,
      ...params?.filters,
    }
    const response = await api.get('/reports', { params: queryParams })
    return response.data
  },

  /**
   * Ottiene una singola rendicontazione per ID
   */
  async getReportById(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },

  /**
   * Crea una nuova rendicontazione
   */
  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await api.post('/reports', data)
    return response.data
  },

  /**
   * Aggiorna una rendicontazione esistente
   */
  async updateReport(id: string, data: UpdateReportDto): Promise<Report> {
    const response = await api.put(`/reports/${id}`, data)
    return response.data
  },

  /**
   * Elimina una rendicontazione
   */
  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`)
  },
}
