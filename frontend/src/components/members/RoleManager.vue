<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-shield-account</v-icon>
      Gestione Ruoli
    </v-card-title>
    <v-divider />
    <v-card-text>
      <!-- Current Roles -->
      <div class="mb-4">
        <h4 class="text-subtitle-1 mb-2">Ruoli Attuali</h4>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="role in currentRoles"
            :key="role"
            :color="getRoleColor(role)"
            closable
            :disabled="role === 'ATLETA' || loading"
            @click:close="handleRemoveRole(role)"
          >
            <v-icon start>{{ getRoleIcon(role) }}</v-icon>
            {{ getRoleLabel(role) }}
          </v-chip>
        </div>
        <p v-if="currentRoles.includes('ATLETA')" class="text-caption text-grey mt-2">
          <v-icon size="small">mdi-information</v-icon>
          Il ruolo ATLETA non può essere rimosso
        </p>
      </div>

      <!-- Add Roles -->
      <div v-if="availableRolesToAdd.length > 0">
        <h4 class="text-subtitle-1 mb-2">Aggiungi Ruolo</h4>
        <v-select
          v-model="selectedRoleToAdd"
          :items="availableRolesToAdd"
          label="Seleziona un ruolo da aggiungere"
          variant="outlined"
          density="compact"
          :disabled="loading"
        >
          <template #item="{ item, props }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon :color="getRoleColor(item.value)">{{ getRoleIcon(item.value) }}</v-icon>
              </template>
            </v-list-item>
          </template>
        </v-select>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!selectedRoleToAdd || loading"
          :loading="loading"
          @click="handleAddRole"
        >
          <v-icon start>mdi-plus</v-icon>
          Aggiungi Ruolo
        </v-btn>
      </div>
      <v-alert v-else type="info" variant="tonal" class="mt-4">
        L'atleta ha già tutti i ruoli disponibili
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Role } from '@/types/auth.types'

interface Props {
  roles: Role[]
  loading?: boolean
}

interface Emits {
  (e: 'add-role', role: Role): void
  (e: 'remove-role', role: Role): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedRoleToAdd = ref<Role | null>(null)

const currentRoles = computed(() => props.roles || [])

const availableRolesToAdd = computed(() => {
  const allRoles = [
    { title: 'Admin', value: Role.ADMIN },
    { title: 'Segreteria', value: Role.SEGRETERIA },
    { title: 'Allenatore', value: Role.ALLENATORE },
  ]
  return allRoles.filter((role) => !currentRoles.value.includes(role.value))
})

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

const getRoleIcon = (role: string): string => {
  const icons: Record<string, string> = {
    ADMIN: 'mdi-shield-crown',
    SEGRETERIA: 'mdi-briefcase',
    ALLENATORE: 'mdi-whistle',
    ATLETA: 'mdi-account',
  }
  return icons[role] || 'mdi-account'
}

const handleAddRole = () => {
  if (selectedRoleToAdd.value) {
    emit('add-role', selectedRoleToAdd.value)
    selectedRoleToAdd.value = null
  }
}

const handleRemoveRole = (role: Role) => {
  if (role !== Role.ATLETA) {
    emit('remove-role', role)
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
