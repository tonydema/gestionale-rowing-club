<template>
  <v-app>
    <!-- App Bar semplice senza navigazione -->
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-rowing</v-icon>
        Calendario Allenamenti
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <v-row>
          <v-col cols="12">
            <h1 class="text-h4 font-weight-bold mb-2">Allenamenti</h1>
            <p class="text-grey-darken-1">Calendario degli allenamenti programmati</p>
          </v-col>
        </v-row>

        <v-card>
          <v-card-title>
            <span>Calendario Allenamenti</span>
          </v-card-title>

          <v-card-text>
            <!-- Filtri (senza tipologia) -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedGroupId"
                  :items="groupOptions"
                  label="Filtra per gruppo"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="startDate"
                  label="Data inizio"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
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

            <!-- Vista Calendario (solo visualizzazione) -->
            <PublicWorkoutCalendar
              :workouts="filteredWorkouts"
              :loading="loading"
              @workout-click="viewWorkout"
            />
          </v-card-text>
        </v-card>

        <!-- Dialog Visualizza Allenamento (solo lettura) -->
        <v-dialog v-model="viewDialogOpen" max-width="600px">
          <v-card v-if="selectedWorkout">
            <v-card-title class="d-flex align-center">
              <v-chip :color="getWorkoutTypeColor(selectedWorkout.type)" class="mr-2">
                <v-icon start>{{ getWorkoutTypeIcon(selectedWorkout.type) }}</v-icon>
                {{ getWorkoutTypeLabel(selectedWorkout.type) }}
              </v-chip>
              <span>{{ selectedWorkout.group?.name }}</span>
              <v-spacer />
              <v-btn icon variant="text" @click="viewDialogOpen = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Data e Ora</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDateTime(selectedWorkout.startDateTime) }} -
                    {{ formatTime(selectedWorkout.endDateTime) }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedWorkout.distance">
                  <template #prepend>
                    <v-icon>mdi-map-marker-distance</v-icon>
                  </template>
                  <v-list-item-title>Distanza</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedWorkout.distance }} m</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedWorkout.repetitions">
                  <template #prepend>
                    <v-icon>mdi-repeat</v-icon>
                  </template>
                  <v-list-item-title>Ripetizioni</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedWorkout.repetitions }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedWorkout.weightDescription">
                  <template #prepend>
                    <v-icon>mdi-dumbbell</v-icon>
                  </template>
                  <v-list-item-title>Pesi</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedWorkout.weightDescription }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedWorkout.notes">
                  <template #prepend>
                    <v-icon>mdi-note-text</v-icon>
                  </template>
                  <v-list-item-title>Note</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedWorkout.notes }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="viewDialogOpen = false">Chiudi</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import type { Workout, WorkoutType } from '@/types/workout.types'
import { WORKOUT_TYPE_LABELS } from '@/types/workout.types'
import PublicWorkoutCalendar from '@/components/workouts/PublicWorkoutCalendar.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const workouts = ref<Workout[]>([])
const groups = ref<{ id: string; name: string }[]>([])
const loading = ref(false)
const viewDialogOpen = ref(false)
const selectedWorkout = ref<Workout | null>(null)

const selectedGroupId = ref<string | null>(null)
const startDate = ref('')
const endDate = ref('')

const groupOptions = computed(() => {
  return groups.value.map((group) => ({
    value: group.id,
    title: group.name,
  }))
})

const filteredWorkouts = computed(() => {
  let filtered = workouts.value

  if (selectedGroupId.value) {
    filtered = filtered.filter((workout) => workout.groupId === selectedGroupId.value)
  }

  if (startDate.value) {
    filtered = filtered.filter((workout) => workout.startDateTime >= startDate.value)
  }

  if (endDate.value) {
    filtered = filtered.filter((workout) => workout.startDateTime <= endDate.value)
  }

  return filtered.sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  )
})

onMounted(async () => {
  await Promise.all([loadWorkouts(), loadGroups()])
})

watch([selectedGroupId, startDate, endDate], () => {
  loadWorkouts()
})

async function loadWorkouts() {
  loading.value = true
  try {
    const params: any = {}
    if (selectedGroupId.value) params.groupId = selectedGroupId.value
    if (startDate.value) params.startDate = startDate.value
    if (endDate.value) params.endDate = endDate.value

    const response = await axios.get(`${API_URL}/public/workouts`, { params })
    workouts.value = response.data.data || []
  } catch (error) {
    console.error('Errore nel caricamento degli allenamenti:', error)
    workouts.value = []
  } finally {
    loading.value = false
  }
}

async function loadGroups() {
  try {
    // Estrai i gruppi unici dagli allenamenti caricati
    const response = await axios.get(`${API_URL}/public/workouts`)
    const allWorkouts = response.data.data || []
    const uniqueGroups = new Map<string, { id: string; name: string }>()
    allWorkouts.forEach((workout: Workout) => {
      if (workout.group && !uniqueGroups.has(workout.group.id)) {
        uniqueGroups.set(workout.group.id, { id: workout.group.id, name: workout.group.name })
      }
    })
    groups.value = Array.from(uniqueGroups.values())
  } catch (error) {
    console.error('Errore nel caricamento dei gruppi:', error)
  }
}

function viewWorkout(workout: Workout) {
  selectedWorkout.value = workout
  viewDialogOpen.value = true
}

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

function getWorkoutTypeLabel(type: WorkoutType): string {
  return WORKOUT_TYPE_LABELS[type] || type
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.v-main {
  background-color: #f5f5f5;
}
</style>
