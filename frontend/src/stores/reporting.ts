import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reportingService } from '@/services/reporting.service'
import type {
  Report,
  CreateReportDto,
  UpdateReportDto,
  ReportFilters,
} from '@/types/reporting.types'

export const useReportingStore = defineStore('reporting', () => {
  const reports = ref<Report[]>([])
  const currentReport = ref<Report | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  /**
   * Carica le rendicontazioni con filtri
   */
  async function fetchReports(params?: { page?: number; limit?: number; filters?: ReportFilters }) {
    loading.value = true
    try {
      const response = await reportingService.getReports(params)
      reports.value = response.data
      total.value = response.total
      page.value = response.page
      limit.value = response.limit
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Carica una rendicontazione per ID
   */
  async function fetchReportById(id: string) {
    loading.value = true
    try {
      currentReport.value = await reportingService.getReportById(id)
      return currentReport.value
    } catch (error) {
      console.error('Error fetching report:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nuova rendicontazione
   */
  async function createReport(data: CreateReportDto) {
    loading.value = true
    try {
      const newReport = await reportingService.createReport(data)
      reports.value.unshift(newReport)
      total.value++
      return newReport
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Aggiorna una rendicontazione
   */
  async function updateReport(id: string, data: UpdateReportDto) {
    loading.value = true
    try {
      const updatedReport = await reportingService.updateReport(id, data)
      const index = reports.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        reports.value[index] = updatedReport
      }
      if (currentReport.value?.id === id) {
        currentReport.value = updatedReport
      }
      return updatedReport
    } catch (error) {
      console.error('Error updating report:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una rendicontazione
   */
  async function deleteReport(id: string) {
    loading.value = true
    try {
      await reportingService.deleteReport(id)
      reports.value = reports.value.filter((r) => r.id !== id)
      total.value--
      if (currentReport.value?.id === id) {
        currentReport.value = null
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    reports,
    currentReport,
    loading,
    total,
    page,
    limit,
    fetchReports,
    fetchReportById,
    createReport,
    updateReport,
    deleteReport,
  }
})
