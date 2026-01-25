<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Gestione Pagamenti</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
              Nuovo Pagamento
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- Filters -->
            <v-row>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.type"
                  :items="typeOptions"
                  label="Tipologia"
                  clearable
                  density="compact"
                  @update:model-value="loadPayments"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.transactionType"
                  :items="transactionTypeOptions"
                  label="Tipo Transazione"
                  clearable
                  density="compact"
                  @update:model-value="loadPayments"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.coachId"
                  :items="athleteOptions"
                  label="Atleta"
                  clearable
                  density="compact"
                  @update:model-value="loadPayments"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.isPaid"
                  :items="paidOptions"
                  label="Stato Pagamento"
                  clearable
                  density="compact"
                  @update:model-value="loadPayments"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="filters.startDate"
                  label="Data Inizio"
                  type="date"
                  clearable
                  density="compact"
                  @update:model-value="loadPayments"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="filters.endDate"
                  label="Data Fine"
                  type="date"
                  clearable
                  density="compact"
                  @update:model-value="loadPayments"
                />
              </v-col>
            </v-row>

            <!-- Data Table -->
            <v-data-table-server
              :headers="headers"
              :items="paymentsStore.payments"
              :loading="paymentsStore.loading"
              :items-length="paymentsStore.total"
              :items-per-page="itemsPerPage"
              @update:options="handlePagination"
            >
              <template #item.type="{ item }">
                <span>{{ formatPaymentType(item.type) }}</span>
              </template>

              <template #item.transactionType="{ item }">
                <v-chip
                  :color="item.transactionType === 'ENTRATA' ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                >
                  {{ item.transactionType === 'ENTRATA' ? 'Entrata' : 'Uscita' }}
                </v-chip>
              </template>

              <template #item.amount="{ item }">
                <span :class="item.transactionType === 'ENTRATA' ? 'text-success' : 'text-error'">
                  {{ item.transactionType === 'ENTRATA' ? '+' : '-' }}€{{ formatAmount(item.amount) }}
                </span>
              </template>

              <template #item.isPaid="{ item }">
                <v-chip
                  :color="item.isPaid ? 'success' : 'warning'"
                  size="small"
                  variant="flat"
                >
                  {{ item.isPaid ? 'Pagato' : 'Non Pagato' }}
                </v-chip>
              </template>

              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>

              <template #item.dueDate="{ item }">
                {{ formatDate(item.dueDate) }}
              </template>

              <template #item.coach="{ item }">
                <span v-if="item.coach">
                  {{ item.coach.member ? `${item.coach.member.firstName} ${item.coach.member.lastName}` : item.coach.username }}
                </span>
                <span v-else class="text-grey">-</span>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEditDialog(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-data-table-server>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment Form Dialog -->
    <PaymentFormDialog
      v-model="dialogOpen"
      :payment="currentPayment"
      :is-edit-mode="isEditMode"
      :coach-options="athleteOptions"
      @save="handleSave"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="500">
      <v-card>
        <v-card-title>Conferma Eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare questo pagamento? Questa azione non può essere annullata.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" @click="handleDelete">Elimina</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { useMembersStore } from '@/stores/members'
import { useAuthStore } from '@/stores/auth'
import type { Payment, PaymentType, TransactionType } from '@/types/payment.types'
import PaymentFormDialog from '@/components/billing/PaymentFormDialog.vue'

const paymentsStore = usePaymentStore()
const membersStore = useMembersStore()
const authStore = useAuthStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditMode = ref(false)
const currentPayment = ref<Payment | null>(null)
const itemsPerPage = ref(10)

const filters = ref({
  type: null as PaymentType | null,
  transactionType: null as TransactionType | null,
  coachId: null as string | null,
  isPaid: null as boolean | null,
  startDate: null as string | null,
  endDate: null as string | null,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const headers = [
  { title: 'Titolo', key: 'title', sortable: false },
  { title: 'Tipologia', key: 'type', sortable: false },
  { title: 'Tipo', key: 'transactionType', sortable: false },
  { title: 'Importo', key: 'amount', sortable: false },
  { title: 'Stato', key: 'isPaid', sortable: false },
  { title: 'Data', key: 'date', sortable: false },
  { title: 'Scadenza', key: 'dueDate', sortable: false },
  { title: 'Atleta', key: 'coach', sortable: false },
  { title: 'Azioni', key: 'actions', sortable: false, align: 'center' },
]

const typeOptions = [
  { title: 'Abbonamento Annuale', value: 'ABBONAMENTO_ANNUALE' },
  { title: 'Lezione', value: 'LEZIONE' },
  { title: 'Rimborso', value: 'RIMBORSO' },
  { title: 'Altro', value: 'ALTRO' },
]

const transactionTypeOptions = [
  { title: 'Entrata', value: 'ENTRATA' },
  { title: 'Uscita', value: 'USCITA' },
]

const paidOptions = [
  { title: 'Pagato', value: true },
  { title: 'Non Pagato', value: false },
]

const athleteOptions = computed(() => {
  return membersStore.members
    .filter((m) => m.isActive)
    .map((m) => ({
      value: m.userId,
      title: `${m.firstName} ${m.lastName}`,
    }))
})

function formatPaymentType(type: PaymentType): string {
  const typeMap = {
    ABBONAMENTO_ANNUALE: 'Abbonamento Annuale',
    LEZIONE: 'Lezione',
    RIMBORSO: 'Rimborso',
    ALTRO: 'Altro',
  }
  return typeMap[type] || type
}

function formatAmount(amount: number): string {
  return Number(amount).toFixed(2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function loadPayments() {
  try {
    await paymentsStore.fetchPayments({
      page: 1,
      limit: itemsPerPage.value,
      filters: {
        type: filters.value.type || undefined,
        transactionType: filters.value.transactionType || undefined,
        coachId: filters.value.coachId || undefined,
        isPaid: filters.value.isPaid !== null ? filters.value.isPaid : undefined,
        startDate: filters.value.startDate || undefined,
        endDate: filters.value.endDate || undefined,
      },
    })
  } catch (error) {
    console.error('Error loading payments:', error)
    showSnackbar('Errore nel caricamento dei pagamenti', 'error')
  }
}

function handlePagination(options: any) {
  const page = options.page || 1
  itemsPerPage.value = options.itemsPerPage || 10
  paymentsStore.fetchPayments({
    page,
    limit: itemsPerPage.value,
    filters: {
      type: filters.value.type || undefined,
      transactionType: filters.value.transactionType || undefined,
      coachId: filters.value.coachId || undefined,
      isPaid: filters.value.isPaid !== null ? filters.value.isPaid : undefined,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    },
  })
}

function openCreateDialog() {
  isEditMode.value = false
  currentPayment.value = null
  dialogOpen.value = true
}

function openEditDialog(payment: Payment) {
  isEditMode.value = true
  currentPayment.value = { ...payment }
  dialogOpen.value = true
}

function confirmDelete(payment: Payment) {
  currentPayment.value = payment
  deleteDialogOpen.value = true
}

async function handleSave() {
  dialogOpen.value = false
  await loadPayments()
  showSnackbar(
    isEditMode.value ? 'Pagamento aggiornato con successo' : 'Pagamento creato con successo',
    'success'
  )
}

async function handleDelete() {
  if (!currentPayment.value) return

  try {
    await paymentsStore.deletePayment(currentPayment.value.id)
    deleteDialogOpen.value = false
    await loadPayments()
    showSnackbar('Pagamento eliminato con successo', 'success')
  } catch (error) {
    console.error('Error deleting payment:', error)
    showSnackbar('Errore durante l\'eliminazione del pagamento', 'error')
  }
}

function showSnackbar(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  // Carica i membri per ottenere la lista degli allenatori
  if (membersStore.members.length === 0) {
    await membersStore.fetchMembers({ page: 1, limit: 1000, isActive: true })
  }
  await loadPayments()
})
</script>
