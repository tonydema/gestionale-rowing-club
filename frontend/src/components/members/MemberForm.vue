<template>
  <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Account Information -->
      <v-col cols="12">
        <h3 class="text-h6 mb-2">Informazioni Account</h3>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.username"
          label="Username *"
          type="text"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-account-circle"
          required
          hint="Username univoco per il login"
          persistent-hint
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.password"
          :label="isEditMode ? 'Password (vuoto = non modificare)' : 'Password *'"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          :rules="isEditMode ? [] : passwordRules"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :required="!isEditMode"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-col>

      <!-- Roles (Only for ADMIN) -->
      <v-col v-if="canManageRoles" cols="12">
        <v-select
          v-model="formData.roles"
          :items="availableRoles"
          label="Ruoli"
          variant="outlined"
          multiple
          chips
          prepend-inner-icon="mdi-shield-account"
          hint="Seleziona uno o più ruoli. ATLETA è sempre presente."
          persistent-hint
        >
          <template #chip="{ item, props }">
            <v-chip v-bind="props" :color="getRoleColor(item.value)" closable>
              {{ item.title }}
            </v-chip>
          </template>
        </v-select>
      </v-col>

      <!-- Divider -->
      <v-col cols="12">
        <v-divider class="my-2" />
        <h3 class="text-h6 mb-2 mt-4">Dati Anagrafici</h3>
      </v-col>

      <!-- Photo Upload -->
      <v-col cols="12" class="d-flex align-center gap-4">
        <v-avatar
          size="150"
          color="grey-lighten-2"
          :style="(photoPreviewUrl || currentPhotoUrl) ? 'cursor: pointer' : ''"
          @click="openPhotoInNewTab"
        >
          <v-img
            v-if="photoPreviewUrl || currentPhotoUrl"
            :src="photoPreviewUrl || photoFullUrl"
            cover
          />
          <v-icon v-else size="60" color="grey">mdi-account</v-icon>
        </v-avatar>
        <div>
          <v-file-input
            v-model="photoFile"
            accept="image/jpeg,image/png,image/webp"
            label="Foto Profilo"
            prepend-icon="mdi-camera"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
            style="max-width: 300px"
            @update:model-value="handlePhotoSelect"
          />
          <div class="d-flex gap-2 mt-2">
            <v-btn
              v-if="currentPhotoUrl && !photoFile"
              color="primary"
              size="small"
              variant="outlined"
              @click="downloadPhoto"
            >
              <v-icon start>mdi-download</v-icon>
              Scarica
            </v-btn>
            <v-btn
              v-if="currentPhotoUrl && !photoFile"
              color="error"
              size="small"
              variant="outlined"
              :loading="deletingPhoto"
              @click="deletePhoto"
            >
              <v-icon start>mdi-delete</v-icon>
              Rimuovi
            </v-btn>
          </div>
          <div v-if="photoFile" class="text-caption text-success mt-2">
            La foto verrà caricata al salvataggio
          </div>
        </div>
      </v-col>

      <!-- Personal Data -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.firstName"
          label="Nome *"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-account"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.lastName"
          label="Cognome *"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-account"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.fiscalCode"
          label="Codice Fiscale *"
          variant="outlined"
          :rules="fiscalCodeRules"
          prepend-inner-icon="mdi-card-account-details"
          required
          maxlength="16"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.dateOfBirth"
          label="Data di Nascita *"
          type="date"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-calendar"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.placeOfBirth"
          label="Luogo di Nascita *"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-map-marker"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.medicalCertExpiry"
          label="Scadenza Certificato Medico"
          type="date"
          variant="outlined"
          prepend-inner-icon="mdi-clipboard-pulse"
          hint="Data di scadenza del certificato medico"
          persistent-hint
          clearable
        />
      </v-col>

      <!-- Categoria Automatica -->
      <v-col v-if="formData.dateOfBirth" cols="12" md="6">
        <v-chip
          :color="computedCategoryColor"
          size="large"
          prepend-icon="mdi-trophy"
        >
          Categoria: {{ computedCategoryLabel }}
        </v-chip>
        <div class="text-caption text-grey mt-1">
          Calcolata automaticamente dall'età ({{ computedAge }} anni)
        </div>
      </v-col>

      <!-- Divider -->
      <v-col cols="12">
        <v-divider class="my-2" />
        <h3 class="text-h6 mb-2 mt-4">Residenza e Contatti</h3>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="formData.email"
          label="Email"
          type="email"
          variant="outlined"
          :rules="optionalEmailRules"
          prepend-inner-icon="mdi-email"
          hint="Opzionale - può essere condivisa"
          persistent-hint
        />
      </v-col>

      <!-- Address -->
      <v-col cols="12">
        <v-text-field
          v-model="formData.address"
          label="Indirizzo *"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-home"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.city"
          label="Città *"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-city"
          required
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
          v-model="formData.postalCode"
          label="CAP *"
          variant="outlined"
          :rules="requiredRules"
          prepend-inner-icon="mdi-mailbox"
          required
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="formData.groupId"
          :items="groupsStore.groups"
          item-title="name"
          item-value="id"
          label="Gruppo"
          variant="outlined"
          prepend-inner-icon="mdi-account-group"
          clearable
          hint="Opzionale"
          persistent-hint
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.phone"
          label="Telefono"
          type="tel"
          variant="outlined"
          prepend-inner-icon="mdi-phone"
        />
      </v-col>

      <!-- Status (Only in edit mode for ADMIN) -->
      <v-col v-if="isEditMode && canManageRoles" cols="12">
        <v-divider class="my-2" />
        <v-switch
          v-model="formData.isActive"
          label="Atleta Attivo"
          color="success"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Form Actions -->
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-end gap-2">
        <v-btn variant="text" @click="$emit('cancel')">
          Annulla
        </v-btn>
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          :loading="loading"
          :disabled="!valid"
        >
          {{ isEditMode ? 'Salva Modifiche' : 'Crea Atleta' }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'
import { membersService } from '@/services/members.service'
import type { CreateMemberDto, UpdateMemberDto, Member } from '@/types/member.types'
import { Role } from '@/types/auth.types'
import { calculateAge, getCategoryByAge, getCategoryLabel, getCategoryColor } from '@/utils/category.utils'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'

interface Props {
  member?: Member | null
  loading?: boolean
}

interface SubmitPayload {
  data: CreateMemberDto | UpdateMemberDto
  photoFile?: File
}

interface Emits {
  (e: 'submit', payload: SubmitPayload): void
  (e: 'cancel'): void
  (e: 'photo-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const formRef = ref()
const valid = ref(false)
const showPassword = ref(false)

// Photo upload state
const photoFile = ref<File | File[] | null>(null)
const uploadingPhoto = ref(false)
const deletingPhoto = ref(false)
const currentPhotoUrl = ref<string | null>(null)
const photoPreviewUrl = ref<string | null>(null)

const photoFullUrl = computed(() => {
  if (!currentPhotoUrl.value) return null
  return `${API_BASE_URL}${currentPhotoUrl.value}`
})

const isEditMode = computed(() => !!props.member)
const canManageRoles = computed(() => authStore.isAdmin)

// Form data
const formData = ref<CreateMemberDto & { isActive?: boolean }>({
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  fiscalCode: '',
  dateOfBirth: '',
  placeOfBirth: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  groupId: undefined,
  medicalCertExpiry: '',
  roles: [Role.ATLETA],
  isActive: true,
})

// Computed properties for category
const computedAge = computed(() => {
  if (!formData.value.dateOfBirth) return 0
  return calculateAge(formData.value.dateOfBirth)
})

const computedCategoryLabel = computed(() => {
  if (!formData.value.dateOfBirth) return ''
  return getCategoryLabel(formData.value.dateOfBirth)
})

const computedCategoryColor = computed(() => {
  if (!formData.value.dateOfBirth) return 'grey'
  const category = getCategoryByAge(formData.value.dateOfBirth)
  return getCategoryColor(category)
})

// Available roles
const availableRoles = [
  { title: 'Admin', value: Role.ADMIN },
  { title: 'Segreteria', value: Role.SEGRETERIA },
  { title: 'Allenatore', value: Role.ALLENATORE },
  { title: 'Atleta', value: Role.ATLETA },
]

// Validation rules
const requiredRules = [
  (v: string) => !!v || 'Campo obbligatorio',
]

const optionalEmailRules = [
  (v: string) => !v || /.+@.+\..+/.test(v) || 'Email non valida',
]

const passwordRules = [
  (v: string) => !!v || 'Password richiesta',
  (v: string) => v.length >= 8 || 'La password deve essere di almeno 8 caratteri',
  (v: string) => /[A-Z]/.test(v) || 'La password deve contenere almeno una lettera maiuscola',
  (v: string) => /[a-z]/.test(v) || 'La password deve contenere almeno una lettera minuscola',
  (v: string) => /[0-9]/.test(v) || 'La password deve contenere almeno un numero',
  (v: string) => /[!@#$%^&*]/.test(v) || 'La password deve contenere almeno un carattere speciale (!@#$%^&*)',
]

const fiscalCodeRules = [
  (v: string) => !!v || 'Codice fiscale richiesto',
  (v: string) => v.length === 16 || 'Il codice fiscale deve essere di 16 caratteri',
  (v: string) => /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i.test(v) || 'Formato codice fiscale non valido',
]

const postalCodeRules = [
  (v: string) => !!v || 'CAP richiesto',
  (v: string) => /^[0-9]{5}$/.test(v) || 'Il CAP deve essere di 5 cifre',
]

// Load groups on mount
onMounted(async () => {
  await groupsStore.fetchGroups()
})

// Watch for member prop changes (edit mode)
watch(
  () => props.member,
  (newMember) => {
    if (newMember) {
      formData.value = {
        username: newMember.user?.username || '',
        email: newMember.user?.email || '',
        password: '', // Never populate password in edit mode
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        fiscalCode: newMember.fiscalCode,
        dateOfBirth: newMember.dateOfBirth.split('T')[0], // Format for date input
        placeOfBirth: newMember.placeOfBirth,
        address: newMember.address,
        city: newMember.city,
        postalCode: newMember.postalCode,
        phone: newMember.phone || '',
        groupId: newMember.groupId || undefined,
        medicalCertExpiry: newMember.medicalCertExpiry?.split('T')[0] || '',
        roles: newMember.user?.roles || [Role.ATLETA],
        isActive: newMember.isActive,
      }
      // Set current photo URL
      currentPhotoUrl.value = newMember.photoUrl || null
    }
  },
  { immediate: true }
)

// Ensure ATLETA is always in roles
watch(
  () => formData.value.roles,
  (newRoles) => {
    if (!newRoles || !newRoles.includes(Role.ATLETA)) {
      formData.value.roles = [...(newRoles || []), Role.ATLETA]
    }
  }
)

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: 'error',
    SEGRETERIA: 'warning',
    ALLENATORE: 'info',
    ATLETA: 'success',
  }
  return colors[role] || 'default'
}

// Photo handling functions
function handlePhotoSelect(file: File | File[] | null) {
  console.log('📸 handlePhotoSelect called with:', file)
  photoFile.value = file
  console.log('📸 photoFile.value set to:', photoFile.value)
  // Create preview URL - handle both single File and File[]
  const actualFile = Array.isArray(file) ? file[0] : file
  if (actualFile) {
    photoPreviewUrl.value = URL.createObjectURL(actualFile)
    console.log('📸 Preview URL created:', photoPreviewUrl.value)
  } else {
    photoPreviewUrl.value = null
  }
}

async function deletePhoto() {
  if (!props.member) return

  deletingPhoto.value = true
  try {
    await membersService.deletePhoto(props.member.id)
    currentPhotoUrl.value = null
    emit('photo-updated')
  } catch (error) {
    console.error('Errore eliminazione foto:', error)
  } finally {
    deletingPhoto.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  const submitData: CreateMemberDto | UpdateMemberDto = {
    username: formData.value.username,
    email: formData.value.email || undefined,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    fiscalCode: formData.value.fiscalCode.toUpperCase(),
    dateOfBirth: formData.value.dateOfBirth,
    placeOfBirth: formData.value.placeOfBirth,
    address: formData.value.address,
    city: formData.value.city,
    postalCode: formData.value.postalCode,
    phone: formData.value.phone || undefined,
    emergencyPhone: formData.value.emergencyPhone,
    medicalCertExpiry: formData.value.medicalCertExpiry || undefined,
    roles: formData.value.roles,
    groupId: formData.value.groupId || undefined,
  }

  // Add password only if provided
  if (formData.value.password) {
    submitData.password = formData.value.password
  }

  // Add isActive only in edit mode
  if (isEditMode.value && formData.value.isActive !== undefined) {
    (submitData as UpdateMemberDto).isActive = formData.value.isActive
  }

  // Pass photo file if selected - handle both single File and File[]
  const photo = photoFile.value
    ? (Array.isArray(photoFile.value) ? photoFile.value[0] : photoFile.value)
    : undefined
  console.log('📸 MemberForm handleSubmit - photoFile.value:', photoFile.value)
  console.log('📸 MemberForm handleSubmit - photo to emit:', photo)
  emit('submit', { data: submitData, photoFile: photo })
}
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
