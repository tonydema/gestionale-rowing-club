import { defineStore } from 'pinia'
import { ref } from 'vue'
import { paymentService } from '@/services/payment.service'
import type {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentFilters,
} from '@/types/payment.types'

export const usePaymentStore = defineStore('payment', () => {
  const payments = ref<Payment[]>([])
  const currentPayment = ref<Payment | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  async function fetchPayments(params?: { page?: number; limit?: number; filters?: PaymentFilters }) {
    loading.value = true
    try {
      const response = await paymentService.getPayments(params)
      payments.value = response.data
      total.value = response.total
      page.value = response.page
      limit.value = response.limit
    } catch (error) {
      console.error('Error fetching payments:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchPaymentById(id: string) {
    loading.value = true
    try {
      currentPayment.value = await paymentService.getPaymentById(id)
      return currentPayment.value
    } catch (error) {
      console.error('Error fetching payment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createPayment(data: CreatePaymentDto) {
    loading.value = true
    try {
      const newPayment = await paymentService.createPayment(data)
      payments.value.unshift(newPayment)
      total.value++
      return newPayment
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updatePayment(id: string, data: UpdatePaymentDto) {
    loading.value = true
    try {
      const updatedPayment = await paymentService.updatePayment(id, data)
      const index = payments.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        payments.value[index] = updatedPayment
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = updatedPayment
      }
      return updatedPayment
    } catch (error) {
      console.error('Error updating payment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deletePayment(id: string) {
    loading.value = true
    try {
      await paymentService.deletePayment(id)
      payments.value = payments.value.filter((p) => p.id !== id)
      total.value--
      if (currentPayment.value?.id === id) {
        currentPayment.value = null
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    payments,
    currentPayment,
    loading,
    total,
    page,
    limit,
    fetchPayments,
    fetchPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
  }
})
