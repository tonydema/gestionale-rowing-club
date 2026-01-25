<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">Gestione Atleti</h1>
        <p class="text-grey-darken-1 mt-2">Lista completa degli atleti tesserati</p>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Atleti</span>
        <v-btn
          v-if="authStore.isAdmin || authStore.isSegreteria"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nuovo Atleta
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchInput"
              prepend-inner-icon="mdi-magnify"
              label="Cerca per nome, cognome o CF"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedCategory"
              :items="categoryOptions"
              label="Categoria"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="membersStore.setCategoryFilter($event)"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedActiveStatus"
              :items="activeStatusOptions"
              label="Stato"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="membersStore.setIsActiveFilter($event)"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              variant="outlined"
              block
              @click="membersStore.clearFilters()"
            >
              Pulisci Filtri
            </v-btn>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-data-table
          :headers="headers"
          :items="membersStore.members"
          :loading="membersStore.isLoading"
          :items-per-page="membersStore.itemsPerPage"
          :page="membersStore.currentPage"
          :server-items-length="membersStore.totalItems"
          @update:page="membersStore.setPage($event)"
          @update:items-per-page="membersStore.setItemsPerPage($event)"
        >
          <template #item.fullName="{ item }">
            {{ item.firstName }} {{ item.lastName }}
          </template>

          <template #item.user.roles="{ item }">
            <v-chip
              v-for="role in item.user?.roles"
              :key="role"
              size="small"
              :color="getRoleColor(role)"
              class="mr-1"
            >
              {{ getRoleLabel(role) }}
            </v-chip>
          </template>

          <template #item.category="{ item }">
            <v-chip size="small" :color="getCategoryColorForMember(item)">
              <v-icon start size="small">mdi-trophy</v-icon>
              {{ getCategoryLabelForMember(item) }}
            </v-chip>
            <div class="text-caption text-grey">
              {{ calculateAge(item.dateOfBirth) }} anni
            </div>
          </template>

          <template #item.medicalCertExpiry="{ item }">
            <v-chip
              v-if="item.medicalCertExpiry"
              size="small"
              :color="isMedicalCertValid(item.medicalCertExpiry) ? 'success' : 'error'"
            >
              <v-icon start size="small">
                {{ isMedicalCertValid(item.medicalCertExpiry) ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ formatDate(item.medicalCertExpiry) }}
            </v-chip>
            <v-chip v-else size="small" color="warning">
              <v-icon start size="small">mdi-alert</v-icon>
              Mancante
            </v-chip>
          </template>

          <template #item.isActive="{ item }">
            <v-chip size="small" :color="item.isActive ? 'success' : 'error'">
              {{ item.isActive ? 'Attivo' : 'Disattivato' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click="viewMember(item)"
            />
            <v-btn
              v-if="(authStore.isAdmin || authStore.isSegreteria) || (authStore.isAtleta && item.userId === authStore.user?.id)"
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="editMember(item)"
            />
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
              <v-icon size="64" color="grey-lighten-1">mdi-account-group-outline</v-icon>
              <p class="text-h6 text-grey mt-4">Nessun atleta trovato</p>
              <p class="text-grey">Prova a modificare i filtri o aggiungi un nuovo atleta</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="900px" persistent scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">{{ isEditMode ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          <span class="text-h5">{{ isEditMode ? 'Modifica Atleta' : 'Nuovo Atleta' }}</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <MemberForm
            :member="membersStore.currentMember"
            :loading="formLoading"
            @submit="handleFormSubmit"
            @cancel="closeDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- View Dialog (Read-Only) -->
    <v-dialog v-model="viewDialogOpen" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-account-details</v-icon>
          <span class="text-h5">Dettagli Atleta</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-row v-if="membersStore.currentMember">
            <v-col cols="12"><h3 class="text-h6">Informazioni Account</h3></v-col>
            <v-col cols="12" md="6"><strong>Username:</strong> {{ membersStore.currentMember.user?.username }}</v-col>
            <v-col cols="12" md="6"><strong>Email:</strong> {{ membersStore.currentMember.user?.email || 'Non specificata' }}</v-col>
            <v-col cols="12"><v-divider class="my-2" /><h3 class="text-h6 mt-4">Dati Anagrafici</h3></v-col>
            <v-col cols="12" md="6"><strong>Nome:</strong> {{ membersStore.currentMember.firstName }}</v-col>
            <v-col cols="12" md="6"><strong>Cognome:</strong> {{ membersStore.currentMember.lastName }}</v-col>
            <v-col cols="12" md="6"><strong>Codice Fiscale:</strong> {{ membersStore.currentMember.fiscalCode }}</v-col>
            <v-col cols="12" md="6"><strong>Data di Nascita:</strong> {{ formatDate(membersStore.currentMember.dateOfBirth) }}</v-col>
            <v-col cols="12" md="6"><strong>Luogo di Nascita:</strong> {{ membersStore.currentMember.placeOfBirth }}</v-col>
            <v-col cols="12" md="6">
              <strong>Categoria:</strong>
              <v-chip size="small" :color="getCategoryColorForMember(membersStore.currentMember)" class="ml-2">
                {{ getCategoryLabelForMember(membersStore.currentMember) }} ({{ calculateAge(membersStore.currentMember.dateOfBirth) }} anni)
              </v-chip>
            </v-col>
            <v-col cols="12"><v-divider class="my-2" /><h3 class="text-h6 mt-4">Residenza e Contatti</h3></v-col>
            <v-col cols="12"><strong>Indirizzo:</strong> {{ membersStore.currentMember.address }}</v-col>
            <v-col cols="12" md="8"><strong>Città:</strong> {{ membersStore.currentMember.city }}</v-col>
            <v-col cols="12" md="4"><strong>CAP:</strong> {{ membersStore.currentMember.postalCode }}</v-col>
            <v-col cols="12" md="6"><strong>Telefono:</strong> {{ membersStore.currentMember.phone || 'Non specificato' }}</v-col>
            <v-col cols="12" md="6">
              <strong>Certificato Medico:</strong>
              <v-chip v-if="membersStore.currentMember.medicalCertExpiry" size="small" :color="isMedicalCertValid(membersStore.currentMember.medicalCertExpiry) ? 'success' : 'error'" class="ml-2">
                {{ formatDate(membersStore.currentMember.medicalCertExpiry) }}
              </v-chip>
              <v-chip v-else size="small" color="warning" class="ml-2">Mancante</v-chip>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialogOpen = false">Chiudi</v-btn>
          <v-btn v-if="authStore.isAdmin || authStore.isSegreteria" color="primary" @click="editFromView">Modifica</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Conferma Eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler disattivare l'atleta <strong>{{ memberToDelete?.firstName }} {{ memberToDelete?.lastName }}</strong>?
          <br />
          <br />
          L'atleta verrà disattivato ma i suoi dati saranno conservati.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" @click="deleteMemberConfirmed">Disattiva</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMembersStore } from '@/stores/members'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { membersService } from '@/services/members.service'
import type { Member, CreateMemberDto, UpdateMemberDto, AgeCategory } from '@/types/member.types'
import MemberForm from '@/components/members/MemberForm.vue'
import { calculateAge, getCategoryByAge, getCategoryLabel, getCategoryColor, CATEGORY_INFO } from '@/utils/category.utils'

const router = useRouter()
const membersStore = useMembersStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Search & Filters
const searchInput = ref('')
const selectedActiveStatus = ref<boolean | null>(null)
const selectedCategory = ref<AgeCategory | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = (value: string) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    membersStore.setSearchQuery(value || '')
  }, 500)
}

const activeStatusOptions = [
  { title: 'Attivi', value: true },
  { title: 'Disattivati', value: false },
]

const categoryOptions = Object.entries(CATEGORY_INFO).map(([key, info]) => ({
  title: info.label,
  value: key,
}))

// Table headers
const headers = [
  { title: 'Nome Completo', key: 'fullName', sortable: false },
  { title: 'Username', key: 'user.username', sortable: false },
  { title: 'Ruoli', key: 'user.roles', sortable: false },
  { title: 'Categoria', key: 'category', sortable: false },
  { title: 'Certificato Medico', key: 'medicalCertExpiry', sortable: false },
  { title: 'Stato', key: 'isActive', sortable: false },
  { title: 'Azioni', key: 'actions', sortable: false, align: 'center' },
]

// Dialogs
const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const isEditMode = ref(false)
const formLoading = ref(false)
const deleteDialogOpen = ref(false)
const memberToDelete = ref<Member | null>(null)

// Methods
const openCreateDialog = () => {
  isEditMode.value = false
  membersStore.clearCurrentMember()
  dialogOpen.value = true
}

const closeDialog = () => {
  dialogOpen.value = false
  membersStore.clearCurrentMember()
}

const handleFormSubmit = async (payload: { data: CreateMemberDto | UpdateMemberDto, photoFile?: File }) => {
  const { data, photoFile } = payload
  console.log('📸 handleFormSubmit called')
  console.log('📸 handleFormSubmit - payload:', payload)
  console.log('📸 handleFormSubmit - data:', data)
  console.log('📸 handleFormSubmit - photoFile:', photoFile)

  try {
    formLoading.value = true

    if (isEditMode.value && membersStore.currentMember) {
      // Update existing member
      await membersStore.updateMember(membersStore.currentMember.id, data as UpdateMemberDto)

      // Upload photo if provided
      console.log('📸 About to check photoFile:', photoFile)
      if (photoFile) {
        console.log('📸 Uploading photo...')
        await membersService.uploadPhoto(membersStore.currentMember.id, photoFile)
        console.log('📸 Photo uploaded!')
      }

      uiStore.showSuccess('Atleta aggiornato con successo')
      closeDialog()
    } else {
      // Create new member
      const newMember = await membersStore.createMember(data as CreateMemberDto)

      // Upload photo if provided
      if (photoFile) {
        await membersService.uploadPhoto(newMember.id, photoFile)
        uiStore.showSuccess('Atleta creato con successo')
        closeDialog()
      } else {
        uiStore.showSuccess('Atleta creato con successo')
        closeDialog()
      }
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Errore durante il salvataggio'
    uiStore.showError(message)
  } finally {
    formLoading.value = false
  }
}

const viewMember = (member: Member) => {
  router.push({ name: 'MemberDetail', params: { id: member.id } })
}

const editMember = (member: Member) => {
  isEditMode.value = true
  membersStore.currentMember = member
  dialogOpen.value = true
}

const editFromView = () => {
  viewDialogOpen.value = false
  isEditMode.value = true
  dialogOpen.value = true
}

const confirmDelete = (member: Member) => {
  memberToDelete.value = member
  deleteDialogOpen.value = true
}

const deleteMemberConfirmed = async () => {
  if (!memberToDelete.value) return

  try {
    await membersStore.deleteMember(memberToDelete.value.id)
    uiStore.showSuccess('Atleta disattivato con successo')
    deleteDialogOpen.value = false
    memberToDelete.value = null
  } catch (error) {
    uiStore.showError('Errore durante la disattivazione dell\'atleta')
  }
}

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    SEGRETERIA: 'Segreteria',
    ALLENATORE: 'Allenatore',
    ATLETA: 'Atleta',
  }
  return labels[role] || role
}

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: 'error',
    SEGRETERIA: 'warning',
    ALLENATORE: 'info',
    ATLETA: 'success',
  }
  return colors[role] || 'default'
}

const isMedicalCertValid = (expiryDate: string): boolean => {
  return new Date(expiryDate) > new Date()
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getCategoryLabelForMember = (member: Member): string => {
  return getCategoryLabel(member.dateOfBirth)
}

const getCategoryColorForMember = (member: Member): string => {
  const category = getCategoryByAge(member.dateOfBirth)
  return getCategoryColor(category)
}

onMounted(async () => {
  try {
    await membersStore.fetchMembers()
  } catch (error) {
    uiStore.showError('Errore durante il caricamento degli atleti')
  }
})
</script>
