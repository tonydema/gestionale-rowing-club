<template>
  <v-dialog :model-value="modelValue" max-width="700px" persistent scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{
          isEditMode ? 'mdi-file-document-edit' : 'mdi-file-document-plus'
        }}</v-icon>
        <span class="text-h5">{{
          isEditMode ? 'Modifica Rendicontazione' : 'Nuova Rendicontazione'
        }}</span>
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="save">
          <v-row>
            <!-- Allenatore (solo per admin/segreteria) -->
            <v-col v-if="authStore.isAdmin || authStore.isSegreteria" cols="12">
              <v-select
                v-model="formData.coachId"
                :items="coachOptions"
                label="Allenatore *"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Data -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.date"
                label="Data *"
                type="date"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Tipologia -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.reportTypeId"
                :items="reportTypeOptions"
                label="Tipologia"
                variant="outlined"
                clearable
                @update:model-value="onReportTypeChange"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #append>
                      <span v-if="item.raw.price" class="text-grey">
                        {{ formatCurrency(item.raw.price) }}
                      </span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Compenso -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.compensation"
                label="Compenso (€)"
                type="number"
                variant="outlined"
                min="0"
                step="0.01"
                prefix="€"
              />
            </v-col>

            <!-- Descrizione -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Descrizione *"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                rows="3"
                required
              />
            </v-col>

            <!-- Selezione Atleti -->
            <v-col cols="12">
              <v-autocomplete
                v-model="formData.athleteIds"
                :items="athleteOptions"
                label="Atleti coinvolti"
                variant="outlined"
                multiple
                chips
                closable-chips
                clearable
              >
                <template #chip="{ props, item }">
                  <v-chip v-bind="props" color="primary" size="small">
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Annulla</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="save">Salva</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useReportingStore } from '@/stores/reporting'
import { useReportTypesStore } from '@/stores/reportTypes'
import { useAuthStore } from '@/stores/auth'
import { useMembersStore } from '@/stores/members'
import type { Report } from '@/types/reporting.types'

const props = defineProps<{
  modelValue: boolean
  report: Report | null
  isEditMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const reportingStore = useReportingStore()
const reportTypesStore = useReportTypesStore()
const authStore = useAuthStore()
const membersStore = useMembersStore()

const formRef = ref<any>(null)
const loading = ref(false)

const formData = ref({
  coachId: '',
  description: '',
  date: '',
  reportTypeId: '' as string | null,
  compensation: null as number | null,
  athleteIds: [] as string[],
})

const reportTypeOptions = computed(() => {
  return reportTypesStore.reportTypes
    .filter((rt) => rt.isEnabled)
    .map((rt) => ({
      value: rt.id,
      title: rt.name,
      price: rt.price,
    }))
})

const coachOptions = computed(() => {
  return membersStore.members
    .filter((m) => m.user?.roles.includes('ALLENATORE'))
    .map((m) => ({
      value: m.userId,
      title: `${m.firstName} ${m.lastName}`,
    }))
})

const athleteOptions = computed(() => {
  return membersStore.members.map((m) => ({
    value: m.id,
    title: `${m.firstName} ${m.lastName}`,
  }))
})

onMounted(async () => {
  // Carica tipologie
  if (reportTypesStore.reportTypes.length === 0) {
    await reportTypesStore.fetchReportTypes(true) // Solo abilitate
  }

  // Carica allenatori e atleti se non già caricati
  if (membersStore.members.length === 0) {
    await membersStore.fetchMembers({ page: 1, limit: 1000, isActive: true })
  }

  // Se l'utente è allenatore, preimposta il suo ID
  if (!authStore.isAdmin && !authStore.isSegreteria && authStore.user) {
    formData.value.coachId = authStore.user.id
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (props.isEditMode && props.report) {
        loadReportData(props.report)
      } else {
        resetForm()
      }
    }
  }
)

function loadReportData(report: Report) {
  formData.value = {
    coachId: report.coachId,
    description: report.description,
    date: report.date.split('T')[0], // Estrae solo la data da ISO string
    reportTypeId: report.reportTypeId || null,
    compensation: report.compensation ? Number(report.compensation) : null,
    athleteIds: report.athletes?.map((a) => a.memberId) || [],
  }
}

function resetForm() {
  formData.value = {
    coachId: authStore.isAdmin || authStore.isSegreteria ? '' : authStore.user?.id || '',
    description: '',
    date: '',
    reportTypeId: null,
    compensation: null,
    athleteIds: [],
  }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

function onReportTypeChange(reportTypeId: string | null) {
  if (reportTypeId) {
    const selectedType = reportTypesStore.reportTypes.find((rt) => rt.id === reportTypeId)
    if (selectedType?.price) {
      formData.value.compensation = Number(selectedType.price)
    }
  }
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const reportData = {
      description: formData.value.description,
      date: formData.value.date,
      reportTypeId: formData.value.reportTypeId || undefined,
      compensation: formData.value.compensation || undefined,
      coachId:
        authStore.isAdmin || authStore.isSegreteria ? formData.value.coachId : authStore.user?.id,
      athleteIds: formData.value.athleteIds.length > 0 ? formData.value.athleteIds : undefined,
    }

    if (props.isEditMode && props.report) {
      await reportingStore.updateReport(props.report.id, reportData)
    } else {
      await reportingStore.createReport(reportData)
    }

    emit('save')
    emit('update:modelValue', false)
  } catch (error: any) {
    console.error('Error saving report:', error)
    alert(error.response?.data?.message || 'Errore nel salvataggio della rendicontazione')
  } finally {
    loading.value = false
  }
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}
</script>
