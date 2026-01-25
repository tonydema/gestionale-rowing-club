<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Rendicontazione</h1>
        <p class="text-grey-darken-1">Gestisci le rendicontazioni delle attività</p>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Rendicontazioni</span>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Nuova Rendicontazione
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Filtri -->
        <v-row class="mb-4">
          <v-col v-if="authStore.isAdmin || authStore.isSegreteria" cols="12" md="3">
            <v-select
              v-model="selectedCoachId"
              :items="coachOptions"
              label="Filtra per Allenatore"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedReportTypeId"
              :items="reportTypeFilterOptions"
              label="Filtra per Tipologia"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="startDate"
              label="Data inizio"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="endDate"
              label="Data fine"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Tabella -->
        <v-data-table
          :headers="headers"
          :items="reportingStore.reports"
          :loading="reportingStore.loading"
          :items-per-page="reportingStore.limit"
          :items-length="reportingStore.total"
          class="elevation-1"
          @update:page="handlePageChange"
        >
          <template #item.coach="{ item }">
            <v-chip color="green" size="small">
              {{
                item.coach.member
                  ? `${item.coach.member.firstName} ${item.coach.member.lastName}`
                  : item.coach.username
              }}
            </v-chip>
          </template>

          <template #item.date="{ item }">
            {{ formatDate(item.date) }}
          </template>

          <template #item.reportType="{ item }">
            <v-chip v-if="item.reportType" color="blue" size="small">
              {{ item.reportType.name }}
            </v-chip>
            <span v-else class="text-grey">-</span>
          </template>

          <template #item.compensation="{ item }">
            <span v-if="item.compensation">{{ formatCurrency(item.compensation) }}</span>
            <span v-else class="text-grey">-</span>
          </template>

          <template #item.athletes="{ item }">
            <template v-if="item.athletes && item.athletes.length > 0">
              <v-chip
                v-for="athlete in item.athletes.slice(0, 2)"
                :key="athlete.id"
                size="x-small"
                class="mr-1"
              >
                {{ athlete.member.firstName }} {{ athlete.member.lastName }}
              </v-chip>
              <v-chip v-if="item.athletes.length > 2" size="x-small" color="grey">
                +{{ item.athletes.length - 2 }}
              </v-chip>
            </template>
            <span v-else class="text-grey">-</span>
          </template>

          <template #item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="editReport(item)" />
            <v-btn
              v-if="authStore.isAdmin || authStore.isSegreteria"
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            />
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
              <p class="text-h6 text-grey mt-4">Nessuna rendicontazione trovata</p>
              <p class="text-grey">Inizia creando una nuova rendicontazione</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Form -->
    <ReportFormDialog
      v-model="dialogOpen"
      :report="currentReport"
      :is-edit-mode="isEditMode"
      @save="handleSave"
      @cancel="dialogOpen = false"
    />

    <!-- Dialog Conferma Eliminazione -->
    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Conferma Eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare questa rendicontazione?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" @click="deleteReport">Elimina</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useReportingStore } from '@/stores/reporting'
import { useReportTypesStore } from '@/stores/reportTypes'
import { useAuthStore } from '@/stores/auth'
import { useMembersStore } from '@/stores/members'
import type { Report } from '@/types/reporting.types'
import ReportFormDialog from '@/components/reporting/ReportFormDialog.vue'

const reportingStore = useReportingStore()
const reportTypesStore = useReportTypesStore()
const authStore = useAuthStore()
const membersStore = useMembersStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditMode = ref(false)
const currentReport = ref<Report | null>(null)
const reportToDelete = ref<Report | null>(null)

const selectedCoachId = ref<string | null>(null)
const selectedReportTypeId = ref<string | null>(null)
const startDate = ref('')
const endDate = ref('')

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const headers = computed(() => {
  return [
    { title: 'Allenatore', key: 'coach', sortable: false },
    { title: 'Data', key: 'date', sortable: true },
    { title: 'Tipologia', key: 'reportType', sortable: false },
    { title: 'Compenso', key: 'compensation', sortable: true },
    { title: 'Atleti', key: 'athletes', sortable: false },
    { title: 'Descrizione', key: 'description', sortable: false },
    { title: 'Azioni', key: 'actions', sortable: false, align: 'end' as const },
  ]
})

const coachOptions = computed(() => {
  return membersStore.members
    .filter((m) => m.user?.roles.includes('ALLENATORE'))
    .map((m) => ({
      value: m.userId,
      title: `${m.firstName} ${m.lastName}`,
    }))
})

const reportTypeFilterOptions = computed(() => {
  return reportTypesStore.reportTypes.map((rt) => ({
    value: rt.id,
    title: rt.name,
  }))
})

onMounted(async () => {
  // Carica gli allenatori se admin/segreteria
  if (authStore.isAdmin || authStore.isSegreteria) {
    if (membersStore.members.length === 0) {
      await membersStore.fetchMembers({ page: 1, limit: 1000, isActive: true })
    }
  }

  // Carica le tipologie
  if (reportTypesStore.reportTypes.length === 0) {
    await reportTypesStore.fetchReportTypes()
  }

  await loadReports()
})

watch([selectedCoachId, selectedReportTypeId, startDate, endDate], () => {
  loadReports()
})

async function loadReports() {
  try {
    const filters: any = {}
    if (selectedCoachId.value) filters.coachId = selectedCoachId.value
    if (selectedReportTypeId.value) filters.reportTypeId = selectedReportTypeId.value
    if (startDate.value) filters.startDate = startDate.value
    if (endDate.value) filters.endDate = endDate.value

    await reportingStore.fetchReports({
      page: reportingStore.page,
      limit: reportingStore.limit,
      filters,
    })
  } catch (error) {
    showSnackbar('Errore nel caricamento delle rendicontazioni', 'error')
  }
}

function openCreateDialog() {
  isEditMode.value = false
  currentReport.value = null
  dialogOpen.value = true
}

function editReport(report: Report) {
  // Controllo permessi: allenatore può modificare solo le proprie
  if (!authStore.isAdmin && !authStore.isSegreteria) {
    if (report.coachId !== authStore.user?.id) {
      showSnackbar('Non hai i permessi per modificare questa rendicontazione', 'error')
      return
    }
  }

  isEditMode.value = true
  currentReport.value = report
  dialogOpen.value = true
}

function confirmDelete(report: Report) {
  // Controllo permessi: allenatore non può eliminare
  if (!authStore.isAdmin && !authStore.isSegreteria) {
    showSnackbar('Non hai i permessi per eliminare questa rendicontazione', 'error')
    return
  }

  reportToDelete.value = report
  deleteDialogOpen.value = true
}

async function deleteReport() {
  if (!reportToDelete.value) return

  try {
    await reportingStore.deleteReport(reportToDelete.value.id)
    showSnackbar('Rendicontazione eliminata con successo', 'success')
    deleteDialogOpen.value = false
    reportToDelete.value = null
  } catch (error) {
    showSnackbar("Errore nell'eliminazione della rendicontazione", 'error')
  }
}

async function handleSave() {
  dialogOpen.value = false
  await loadReports()
  showSnackbar(
    isEditMode.value
      ? 'Rendicontazione aggiornata con successo'
      : 'Rendicontazione creata con successo',
    'success'
  )
}

function handlePageChange(page: number) {
  reportingStore.page = page
  loadReports()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function showSnackbar(message: string, color: string) {
  snackbar.value = {
    show: true,
    message,
    color,
  }
}
</script>
