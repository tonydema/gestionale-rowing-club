<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Tipi di Rendicontazione</h1>
        <p class="text-grey-darken-1">Gestisci le tipologie di rendicontazione disponibili</p>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Tipologie</span>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Nuova Tipologia
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="reportTypesStore.reportTypes"
          :loading="reportTypesStore.loading"
          class="elevation-1"
        >
          <template #item.price="{ item }">
            <span v-if="item.price">{{ formatCurrency(item.price) }}</span>
            <span v-else class="text-grey">-</span>
          </template>

          <template #item.isEnabled="{ item }">
            <v-chip :color="item.isEnabled ? 'success' : 'grey'" size="small">
              {{ item.isEnabled ? 'Abilitato' : 'Disabilitato' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="editType(item)" />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            />
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-tag-outline</v-icon>
              <p class="text-h6 text-grey mt-4">Nessuna tipologia trovata</p>
              <p class="text-grey">Inizia creando una nuova tipologia</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog Form -->
    <v-dialog v-model="dialogOpen" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">{{ isEditMode ? 'mdi-tag-edit' : 'mdi-tag-plus' }}</v-icon>
          <span class="text-h5">{{ isEditMode ? 'Modifica Tipologia' : 'Nuova Tipologia' }}</span>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="formRef" @submit.prevent="save">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Nome *"
                  :rules="[(v) => !!v || 'Campo obbligatorio']"
                  variant="outlined"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Descrizione"
                  variant="outlined"
                  rows="3"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.price"
                  label="Prezzo/Compenso (€)"
                  type="number"
                  variant="outlined"
                  min="0"
                  step="0.01"
                  prefix="€"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.isEnabled"
                  label="Abilitato"
                  color="success"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Annulla</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save">Salva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Conferma Eliminazione -->
    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Conferma Eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare la tipologia "{{ typeToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" :loading="saving" @click="deleteType">Elimina</v-btn>
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
import { ref, onMounted } from 'vue'
import { useReportTypesStore } from '@/stores/reportTypes'
import type { ReportTypeConfig } from '@/types/reporting.types'

const reportTypesStore = useReportTypesStore()

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditMode = ref(false)
const currentType = ref<ReportTypeConfig | null>(null)
const typeToDelete = ref<ReportTypeConfig | null>(null)
const formRef = ref<any>(null)
const saving = ref(false)

const formData = ref({
  name: '',
  description: '',
  price: null as number | null,
  isEnabled: true,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const headers = [
  { title: 'Nome', key: 'name', sortable: true },
  { title: 'Descrizione', key: 'description', sortable: false },
  { title: 'Prezzo', key: 'price', sortable: true },
  { title: 'Stato', key: 'isEnabled', sortable: false },
  { title: 'Azioni', key: 'actions', sortable: false, align: 'end' as const },
]

onMounted(async () => {
  await loadTypes()
})

async function loadTypes() {
  try {
    await reportTypesStore.fetchReportTypes()
  } catch (error) {
    showSnackbar('Errore nel caricamento delle tipologie', 'error')
  }
}

function openCreateDialog() {
  isEditMode.value = false
  currentType.value = null
  resetForm()
  dialogOpen.value = true
}

function editType(type: ReportTypeConfig) {
  isEditMode.value = true
  currentType.value = type
  formData.value = {
    name: type.name,
    description: type.description || '',
    price: type.price || null,
    isEnabled: type.isEnabled,
  }
  dialogOpen.value = true
}

function confirmDelete(type: ReportTypeConfig) {
  typeToDelete.value = type
  deleteDialogOpen.value = true
}

async function deleteType() {
  if (!typeToDelete.value) return

  saving.value = true
  try {
    await reportTypesStore.deleteReportType(typeToDelete.value.id)
    showSnackbar('Tipologia eliminata con successo', 'success')
    deleteDialogOpen.value = false
    typeToDelete.value = null
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || "Errore nell'eliminazione", 'error')
  } finally {
    saving.value = false
  }
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const data = {
      name: formData.value.name,
      description: formData.value.description || undefined,
      price: formData.value.price || undefined,
      isEnabled: formData.value.isEnabled,
    }

    if (isEditMode.value && currentType.value) {
      await reportTypesStore.updateReportType(currentType.value.id, data)
      showSnackbar('Tipologia aggiornata con successo', 'success')
    } else {
      await reportTypesStore.createReportType(data)
      showSnackbar('Tipologia creata con successo', 'success')
    }

    dialogOpen.value = false
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'Errore nel salvataggio', 'error')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    price: null,
    isEnabled: true,
  }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function showSnackbar(message: string, color: string) {
  snackbar.value = { show: true, message, color }
}
</script>
