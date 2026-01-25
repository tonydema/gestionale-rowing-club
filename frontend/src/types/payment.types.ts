// Types per il modulo Pagamenti

export interface Payment {
  id: string
  title: string
  type: PaymentType
  quantity?: number
  dueDate?: string // ISO date string
  transactionType: TransactionType
  amount: number
  isPaid: boolean
  coachId?: string
  date: string // ISO date string
  notes?: string
  coach?: {
    id: string
    username: string
    member?: {
      firstName: string
      lastName: string
    }
  }
  createdAt: string
  updatedAt: string
}

export enum PaymentType {
  ABBONAMENTO_ANNUALE = 'ABBONAMENTO_ANNUALE',
  LEZIONE = 'LEZIONE',
  RIMBORSO = 'RIMBORSO',
  ALTRO = 'ALTRO',
}

export enum TransactionType {
  ENTRATA = 'ENTRATA',
  USCITA = 'USCITA',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.ABBONAMENTO_ANNUALE]: 'Abbonamento Annuale',
  [PaymentType.LEZIONE]: 'Lezione',
  [PaymentType.RIMBORSO]: 'Rimborso',
  [PaymentType.ALTRO]: 'Altro',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.ENTRATA]: 'Entrata',
  [TransactionType.USCITA]: 'Uscita',
}

export interface CreatePaymentDto {
  title: string
  type: PaymentType
  quantity?: number
  dueDate?: string
  transactionType: TransactionType
  amount: number
  isPaid: boolean
  coachId?: string
  date: string
  notes?: string
}

export interface UpdatePaymentDto {
  title?: string
  type?: PaymentType
  quantity?: number
  dueDate?: string
  transactionType?: TransactionType
  amount?: number
  isPaid?: boolean
  coachId?: string
  date?: string
  notes?: string
}

export interface PaymentFilters {
  type?: PaymentType
  transactionType?: TransactionType
  isPaid?: boolean
  coachId?: string
  startDate?: string
  endDate?: string
}

export interface PaymentListResponse {
  data: Payment[]
  total: number
  page: number
  limit: number
}
