<template>
  <v-dialog :model-value="modelValue" max-width="700px" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="workout">
      <v-card-title class="d-flex justify-space-between align-center bg-primary">
        <span class="text-white">Dettagli Allenamento</span>
        <v-btn icon="mdi-close" variant="text" color="white" @click="emit('close')" />
      </v-card-title>

      <v-card-text class="pt-6">
        <v-row>
          <v-col cols="12">
            <div class="mb-4">
              <v-chip
                :color="getWorkoutTypeColor(workout.type)"
                :prepend-icon="getWorkoutTypeIcon(workout.type)"
                size="large"
              >
                {{ WORKOUT_TYPE_LABELS[workout.type] }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-grey-darken-1">Gruppo</div>
            <div class="text-body-1 font-weight-medium">{{ workout.group.name }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-grey-darken-1">Creato da</div>
            <div class="text-body-1 font-weight-medium">
              {{ workout.createdBy.member?.firstName }} {{ workout.createdBy.member?.lastName }}
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-grey-darken-1">Data e ora inizio</div>
            <div class="text-body-1 font-weight-medium">{{ formatDateTime(workout.startDateTime) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-grey-darken-1">Data e ora fine</div>
            <div class="text-body-1 font-weight-medium">{{ formatDateTime(workout.endDateTime) }}</div>
          </v-col>

          <!-- Campi condizionali -->
          <template v-if="workout.type !== 'PESI'">
            <v-col cols="12" md="6">
              <div class="text-caption text-grey-darken-1">Distanza</div>
              <div class="text-body-1 font-weight-medium">
                {{ workout.distance ? `${workout.distance} m` : '-' }}
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption text-grey-darken-1">Ripetizioni</div>
              <div class="text-body-1 font-weight-medium">{{ workout.repetitions || '-' }}</div>
            </v-col>
          </template>

          <template v-if="workout.type === 'PESI'">
            <v-col cols="12">
              <div class="text-caption text-grey-darken-1">Descrizione esercizi</div>
              <div class="text-body-1 font-weight-medium">{{ workout.weightDescription || '-' }}</div>
            </v-col>
          </template>

          <v-col v-if="workout.notes" cols="12">
            <div class="text-caption text-grey-darken-1">Note</div>
            <div class="text-body-1">{{ workout.notes }}</div>
          </v-col>

          <v-col cols="12">
            <v-divider class="my-2" />
            <div class="text-caption text-grey-darken-1">
              Creato il {{ formatDateTime(workout.createdAt) }}
            </div>
            <div v-if="workout.updatedAt !== workout.createdAt" class="text-caption text-grey-darken-1">
              Modificato il {{ formatDateTime(workout.updatedAt) }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions v-if="canEdit">
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">Chiudi</v-btn>
        <v-btn color="error" variant="text" @click="emit('delete')">
          <v-icon start>mdi-delete</v-icon>
          Elimina
        </v-btn>
        <v-btn color="primary" variant="flat" @click="emit('edit')">
          <v-icon start>mdi-pencil</v-icon>
          Modifica
        </v-btn>
      </v-card-actions>
      <v-card-actions v-else>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">Chiudi</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Workout, WorkoutType } from '@/types/workout.types'
import { WORKOUT_TYPE_LABELS } from '@/types/workout.types'

const props = defineProps<{
  modelValue: boolean
  workout: Workout | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const authStore = useAuthStore()

const canEdit = computed(() => {
  return authStore.isAdmin || authStore.isAllenatore
})

function getWorkoutTypeColor(type: WorkoutType): string {
  const colors: Record<WorkoutType, string> = {
    PESI: 'orange',
    CORSA: 'green',
    REMERGOMETRO: 'blue',
    BARCA: 'cyan',
    BIKE: 'purple',
  }
  return colors[type] || 'grey'
}

function getWorkoutTypeIcon(type: WorkoutType): string {
  const icons: Record<WorkoutType, string> = {
    PESI: 'mdi-dumbbell',
    CORSA: 'mdi-run',
    REMERGOMETRO: 'mdi-rowing',
    BARCA: 'mdi-ferry',
    BIKE: 'mdi-bike',
  }
  return icons[type] || 'mdi-calendar'
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
