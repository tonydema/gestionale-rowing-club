import api from './api'
import type {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentFilters,
  PaymentListResponse,
} from '@/types/payment.types'

export const paymentService = {
  /**
   * Ottiene la lista dei pagamenti con filtri
   */
  async getPayments(params?: {
    page?: number
    limit?: number
    filters?: PaymentFilters
  }): Promise<PaymentListResponse> {
    const queryParams = {
      page: params?.page,
      limit: params?.limit,
      ...params?.filters,
    }
    const response = await api.get('/payments', { params: queryParams })
    return response.data
  },

  /**
   * Ottiene un singolo pagamento per ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  /**
   * Crea un nuovo pagamento
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    const response = await api.post('/payments', data)
    return response.data
  },

  /**
   * Aggiorna un pagamento esistente
   */
  async updatePayment(id: string, data: UpdatePaymentDto): Promise<Payment> {
    const response = await api.put(`/payments/${id}`, data)
    return response.data
  },

  /**
   * Elimina un pagamento
   */
  async deletePayment(id: string): Promise<void> {
    await api.delete(`/payments/${id}`)
  },
}
