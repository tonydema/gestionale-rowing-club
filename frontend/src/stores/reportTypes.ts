import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type {
  ReportTypeConfig,
  CreateReportTypeDto,
  UpdateReportTypeDto,
} from '@/types/reporting.types'

export const useReportTypesStore = defineStore('reportTypes', () => {
  const reportTypes = ref<ReportTypeConfig[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchReportTypes(onlyEnabled = false) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/report-types', {
        params: { onlyEnabled: onlyEnabled ? 'true' : undefined },
      })
      reportTypes.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nel caricamento delle tipologie'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createReportType(data: CreateReportTypeDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/report-types', data)
      reportTypes.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nella creazione della tipologia'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateReportType(id: string, data: UpdateReportTypeDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch(`/report-types/${id}`, data)
      const index = reportTypes.value.findIndex((rt) => rt.id === id)
      if (index !== -1) {
        reportTypes.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nella modifica della tipologia'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteReportType(id: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/report-types/${id}`)
      reportTypes.value = reportTypes.value.filter((rt) => rt.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nell'eliminazione della tipologia"
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    reportTypes,
    loading,
    error,
    fetchReportTypes,
    createReportType,
    updateReportType,
    deleteReportType,
  }
})
