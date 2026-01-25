<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-btn
          :to="{ name: 'Members' }"
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-4"
        >
          Torna alla lista atleti
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4">Caricamento dettagli atleta...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="member">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center bg-primary">
            <div class="d-flex align-center">
              <v-avatar color="white" size="64" class="mr-3">
                <v-img
                  v-if="member.photoUrl"
                  :src="photoFullUrl"
                  cover
                />
                <v-icon v-else color="primary" size="40">mdi-account</v-icon>
              </v-avatar>
              <div>
                <h2 class="text-h5">{{ member.lastName }} {{ member.firstName }}</h2>
                <div class="text-subtitle-1">{{ categoryLabel }} - {{ age }} anni</div>
              </div>
            </div>
            <v-chip :color="categoryColor" size="large">
              {{ categoryLabel }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-row>
              <!-- Sezione Dati Anagrafici -->
              <v-col cols="12">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-card-account-details</v-icon>
                  Dati Anagrafici
                </h3>
                <v-divider class="mb-4" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.firstName"
                  label="Nome"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.lastName"
                  label="Cognome"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.fiscalCode"
                  label="Codice Fiscale"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(member.dateOfBirth)"
                  label="Data di Nascita"
                  readonly
                  variant="outlined"
                  density="comfortable"
                >
                  <template #append-inner>
                    <v-chip size="small" color="info">{{ age }} anni</v-chip>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.placeOfBirth"
                  label="Luogo di Nascita"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <!-- Sezione Contatti -->
              <v-col cols="12" class="mt-4">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-contacts</v-icon>
                  Contatti
                </h3>
                <v-divider class="mb-4" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.address"
                  label="Indirizzo"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="member.city"
                  label="Città"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  :model-value="member.postalCode"
                  label="CAP"
                  readonly
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.phone || 'Non specificato'"
                  label="Telefono"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>

              <!-- Sezione Account -->
              <v-col cols="12" class="mt-4">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-account-key</v-icon>
                  Dati Account
                </h3>
                <v-divider class="mb-4" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.user?.username || 'N/A'"
                  label="Username"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-circle"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.user?.email || 'Non specificato'"
                  label="Email"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(member.membershipDate)"
                  label="Data Iscrizione"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-check"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.isActive ? 'Attivo' : 'Non attivo'"
                  label="Stato"
                  readonly
                  variant="outlined"
                  density="comfortable"
                >
                  <template #prepend-inner>
                    <v-chip :color="member.isActive ? 'success' : 'error'" size="small">
                      {{ member.isActive ? 'Attivo' : 'Non attivo' }}
                    </v-chip>
                  </template>
                </v-text-field>
              </v-col>

              <!-- Sezione Ruoli -->
              <v-col cols="12" class="mt-4">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-shield-account</v-icon>
                  Ruoli
                </h3>
                <v-divider class="mb-4" />
              </v-col>

              <v-col cols="12">
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="role in member.user?.roles"
                    :key="role"
                    :color="getRoleColor(role)"
                    size="large"
                  >
                    <v-icon start>{{ getRoleIcon(role) }}</v-icon>
                    {{ getRoleLabel(role) }}
                  </v-chip>
                  <v-chip v-if="!member.user?.roles || member.user.roles.length === 0" color="grey">
                    Nessun ruolo assegnato
                  </v-chip>
                </div>
              </v-col>

              <!-- Sezione Gruppo -->
              <v-col cols="12" class="mt-4">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-account-multiple</v-icon>
                  Gruppo
                </h3>
                <v-divider class="mb-4" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="member.group?.name || 'Nessun gruppo assegnato'"
                  label="Gruppo di Appartenenza"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-group"
                />
              </v-col>

              <!-- Sezione Certificato Medico -->
              <v-col cols="12" class="mt-4">
                <h3 class="text-h6 mb-4">
                  <v-icon class="mr-2">mdi-file-document</v-icon>
                  Certificato Medico
                </h3>
                <v-divider class="mb-4" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="
                    member.medicalCertExpiry
                      ? formatDate(member.medicalCertExpiry)
                      : 'Non specificato'
                  "
                  label="Scadenza Certificato Medico"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar"
                >
                  <template #append-inner>
                    <v-chip v-if="member.medicalCertExpiry" :color="medicalCertColor" size="small">
                      {{ medicalCertStatus }}
                    </v-chip>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn :to="{ name: 'Members' }" variant="text"> Chiudi </v-btn>
            <v-btn
              v-if="authStore.isAdmin || authStore.isSegreteria"
              color="primary"
              variant="flat"
              @click="goToEdit"
            >
              <v-icon start>mdi-pencil</v-icon>
              Modifica
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { membersService } from '@/services/members.service'
import type { Member } from '@/types/member.types'
import type { Role } from '@/types/auth.types'
import {
  calculateAge,
  getCategoryByAge,
  getCategoryLabel,
  getCategoryColor,
} from '@/utils/category.utils'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const member = ref<Member | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const photoFullUrl = computed(() => {
  if (!member.value?.photoUrl) return null
  return `${API_BASE_URL}${member.value.photoUrl}`
})

const age = computed(() => {
  if (!member.value) return 0
  return calculateAge(member.value.dateOfBirth)
})

const category = computed(() => {
  if (!member.value) return null
  return getCategoryByAge(member.value.dateOfBirth)
})

const categoryLabel = computed(() => {
  if (!member.value) return ''
  return getCategoryLabel(member.value.dateOfBirth)
})

const categoryColor = computed(() => {
  if (!category.value) return 'grey'
  return getCategoryColor(category.value)
})

const medicalCertStatus = computed(() => {
  if (!member.value?.medicalCertExpiry) return 'Non specificato'

  const expiryDate = new Date(member.value.medicalCertExpiry)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'Scaduto'
  if (daysUntilExpiry <= 30) return `Scade tra ${daysUntilExpiry} giorni`
  return 'Valido'
})

const medicalCertColor = computed(() => {
  if (!member.value?.medicalCertExpiry) return 'grey'

  const expiryDate = new Date(member.value.medicalCertExpiry)
  const today = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'error'
  if (daysUntilExpiry <= 30) return 'warning'
  return 'success'
})

onMounted(async () => {
  await fetchMember()
})

async function fetchMember() {
  const memberId = route.params.id as string
  if (!memberId) {
    error.value = 'ID atleta non valido'
    return
  }

  loading.value = true
  error.value = null

  try {
    member.value = await membersService.getById(memberId)
  } catch (err: any) {
    console.error('Error fetching member:', err)
    error.value = err.response?.data?.message || 'Errore nel caricamento dei dettagli atleta'
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    ADMIN: 'Amministratore',
    SEGRETERIA: 'Segreteria',
    ALLENATORE: 'Allenatore',
    ATLETA: 'Atleta',
  }
  return labels[role] || role
}

function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    ADMIN: 'red',
    SEGRETERIA: 'blue',
    ALLENATORE: 'green',
    ATLETA: 'orange',
  }
  return colors[role] || 'grey'
}

function getRoleIcon(role: Role): string {
  const icons: Record<Role, string> = {
    ADMIN: 'mdi-shield-crown',
    SEGRETERIA: 'mdi-briefcase',
    ALLENATORE: 'mdi-whistle',
    ATLETA: 'mdi-account',
  }
  return icons[role] || 'mdi-account'
}

function goToEdit() {
  // Per ora torniamo alla lista, in futuro si può implementare una modale di modifica
  router.push({ name: 'Members' })
}
</script>
