<template>
  <v-dialog :model-value="modelValue" max-width="700" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>
        {{ isEditMode ? 'Modifica Pagamento' : 'Nuovo Pagamento' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Titolo -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.title"
                label="Titolo *"
                :rules="[rules.required]"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Tipologia -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                :items="typeOptions"
                label="Tipologia *"
                :rules="[rules.required]"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Quantità -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.quantity"
                label="Quantità"
                type="number"
                min="0"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Tipo Transazione -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.transactionType"
                :items="transactionTypeOptions"
                label="Entrata/Uscita *"
                :rules="[rules.required]"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Importo -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.amount"
                label="Importo (€) *"
                type="number"
                min="0"
                step="0.01"
                :rules="[rules.required, rules.positiveNumber]"
                density="compact"
                variant="outlined"
                prefix="€"
              />
            </v-col>

            <!-- Data -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.date"
                label="Data *"
                type="date"
                :rules="[rules.required]"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Scadenza -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.dueDate"
                label="Scadenza"
                type="date"
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Atleta -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.coachId"
                :items="coachOptions"
                label="Atleta"
                clearable
                density="compact"
                variant="outlined"
              />
            </v-col>

            <!-- Stato Pagamento -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.isPaid"
                label="Pagato"
                color="success"
                density="compact"
                hide-details
              />
            </v-col>

            <!-- Note -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.notes"
                label="Note"
                rows="3"
                density="compact"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleClose">Annulla</v-btn>
        <v-btn
          :color="formData.transactionType === 'ENTRATA' ? 'success' : 'error'"
          variant="flat"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? 'Salva' : 'Crea' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import type { Payment, PaymentType, TransactionType } from '@/types/payment.types'

interface Props {
  modelValue: boolean
  payment: Payment | null
  isEditMode: boolean
  coachOptions: Array<{ title: string; value: string }>
}

interface Emit {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const paymentsStore = usePaymentStore()
const formRef = ref<any>(null)
const loading = ref(false)

const formData = ref({
  title: '',
  type: '' as PaymentType,
  quantity: undefined as number | undefined,
  dueDate: '',
  transactionType: '' as TransactionType,
  amount: 0,
  isPaid: false,
  coachId: undefined as string | undefined,
  date: '',
  notes: '',
})

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

const rules = {
  required: (value: any) => !!value || 'Campo obbligatorio',
  positiveNumber: (value: number) => value >= 0 || 'Il valore deve essere positivo',
}

watch(
  () => props.payment,
  (newPayment) => {
    if (newPayment && props.isEditMode) {
      formData.value = {
        title: newPayment.title,
        type: newPayment.type,
        quantity: newPayment.quantity,
        dueDate: newPayment.dueDate.split('T')[0],
        transactionType: newPayment.transactionType,
        amount: Number(newPayment.amount),
        isPaid: newPayment.isPaid,
        coachId: newPayment.coachId,
        date: newPayment.date.split('T')[0],
        notes: newPayment.notes || '',
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)

function resetForm() {
  formData.value = {
    title: '',
    type: '' as PaymentType,
    quantity: undefined,
    dueDate: '',
    transactionType: '' as TransactionType,
    amount: 0,
    isPaid: false,
    coachId: undefined,
    date: '',
    notes: '',
  }
  formRef.value?.resetValidation()
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const payload = {
      title: formData.value.title,
      type: formData.value.type,
      quantity: formData.value.quantity,
      dueDate: formData.value.dueDate,
      transactionType: formData.value.transactionType,
      amount: formData.value.amount,
      isPaid: formData.value.isPaid,
      coachId: formData.value.coachId,
      date: formData.value.date,
      notes: formData.value.notes,
    }

    if (props.isEditMode && props.payment) {
      await paymentsStore.updatePayment(props.payment.id, payload)
    } else {
      await paymentsStore.createPayment(payload)
    }

    emit('save')
    handleClose()
  } catch (error) {
    console.error('Error saving payment:', error)
  } finally {
    loading.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}
</script>
