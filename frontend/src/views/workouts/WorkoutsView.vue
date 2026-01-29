<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Allenamenti</h1>
        <p class="text-grey-darken-1">Gestisci gli allenamenti dei gruppi</p>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Calendario Allenamenti</span>
        <div class="d-flex gap-2">
          <v-btn
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-open-in-new"
            @click="openPublicPage"
          >
            Pagina Pubblica
          </v-btn>
          <v-btn
            v-if="authStore.isAdmin || authStore.isAllenatore"
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            Nuovo Allenamento
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <!-- Filtri -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedTypes"
              :items="workoutTypeOptions"
              label="Filtra per tipologia"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              hide-details
            >
              <template #chip="{ item, props }">
                <v-chip
                  v-bind="props"
                  :color="getWorkoutTypeColor(item.value)"
                  :prepend-icon="getWorkoutTypeIcon(item.value)"
                >
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
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

        <!-- Vista Calendario -->
        <WorkoutCalendarView
          :workouts="filteredWorkouts"
          :loading="workoutStore.loading"
          @workout-click="viewWorkout"
          @date-select="handleDateSelect"
        />
      </v-card-text>
    </v-card>

    <!-- Dialog Crea/Modifica Allenamento -->
    <WorkoutFormDialog
      v-model="dialogOpen"
      :workout="currentWorkout"
      :is-edit-mode="isEditMode"
      @save="handleSaveWorkout"
      @cancel="dialogOpen = false"
    />

    <!-- Dialog Visualizza Allenamento -->
    <WorkoutDetailDialog
      v-model="viewDialogOpen"
      :workout="selectedWorkout"
      @edit="editFromView"
      @delete="deleteFromView"
      @close="viewDialogOpen = false"
    />

    <!-- Dialog Conferma Eliminazione -->
    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Conferma Eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare questo allenamento?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" @click="deleteWorkout">Elimina</v-btn>
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
import { useWorkoutStore } from '@/stores/workout'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'
import type { Workout, WorkoutType } from '@/types/workout.types'
import { WORKOUT_TYPE_LABELS } from '@/types/workout.types'
import WorkoutFormDialog from '@/components/workouts/WorkoutFormDialog.vue'
import WorkoutDetailDialog from '@/components/workouts/WorkoutDetailDialog.vue'
import WorkoutCalendarView from '@/components/workouts/WorkoutCalendarView.vue'

const workoutStore = useWorkoutStore()
const authStore = useAuthStore()
const groupStore = useGroupsStore()

const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditMode = ref(false)
const currentWorkout = ref<Workout | null>(null)
const selectedWorkout = ref<Workout | null>(null)
const workoutToDelete = ref<Workout | null>(null)

const selectedTypes = ref<WorkoutType[]>([])
const selectedGroupId = ref<string | null>(null)
const startDate = ref('')
const endDate = ref('')

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const workoutTypeOptions = computed(() => {
  return Object.entries(WORKOUT_TYPE_LABELS).map(([value, title]) => ({
    value,
    title,
  }))
})

const groupOptions = computed(() => {
  return groupStore.groups.map((group) => ({
    value: group.id,
    title: group.name,
  }))
})

const filteredWorkouts = computed(() => {
  let filtered = workoutStore.workouts

  if (selectedTypes.value.length > 0) {
    filtered = filtered.filter((workout) => selectedTypes.value.includes(workout.type))
  }

  if (selectedGroupId.value) {
    filtered = filtered.filter((workout) => workout.groupId === selectedGroupId.value)
  }

  if (startDate.value) {
    filtered = filtered.filter((workout) => workout.startDateTime >= startDate.value)
  }

  if (endDate.value) {
    filtered = filtered.filter((workout) => workout.startDateTime <= endDate.value)
  }

  // Se l'utente è un atleta, mostra solo gli allenamenti del suo gruppo
  if (authStore.isAtleta && authStore.user?.member?.groupId) {
    filtered = filtered.filter((workout) => workout.groupId === authStore.user?.member?.groupId)
  }

  return filtered.sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  )
})

onMounted(async () => {
  await Promise.all([loadWorkouts(), groupStore.fetchGroups()])
})

watch([selectedTypes, selectedGroupId, startDate, endDate], () => {
  loadWorkouts()
})

async function loadWorkouts() {
  try {
    await workoutStore.fetchWorkouts({
      filters: {
        type: selectedTypes.value.length > 0 ? selectedTypes.value[0] : undefined,
        groupId: selectedGroupId.value || undefined,
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined,
      },
    })
  } catch (error) {
    showSnackbar('Errore nel caricamento degli allenamenti', 'error')
  }
}

function openCreateDialog() {
  isEditMode.value = false
  currentWorkout.value = null
  dialogOpen.value = true
}

function editWorkout(workout: Workout) {
  isEditMode.value = true
  currentWorkout.value = workout
  dialogOpen.value = true
}

async function viewWorkout(workout: Workout) {
  try {
    selectedWorkout.value = await workoutStore.getWorkoutById(workout.id)
    viewDialogOpen.value = true
  } catch (error) {
    showSnackbar('Errore nel caricamento dei dettagli dell\'allenamento', 'error')
  }
}

function editFromView() {
  viewDialogOpen.value = false
  if (selectedWorkout.value) {
    isEditMode.value = true
    currentWorkout.value = selectedWorkout.value
    dialogOpen.value = true
  }
}

function deleteFromView() {
  viewDialogOpen.value = false
  if (selectedWorkout.value) {
    confirmDelete(selectedWorkout.value)
  }
}

async function handleSaveWorkout() {
  dialogOpen.value = false
  await loadWorkouts()
  showSnackbar(
    isEditMode.value ? 'Allenamento aggiornato con successo' : 'Allenamento creato con successo',
    'success'
  )
}

function confirmDelete(workout: Workout) {
  workoutToDelete.value = workout
  deleteDialogOpen.value = true
}

async function deleteWorkout() {
  if (!workoutToDelete.value) return

  try {
    await workoutStore.deleteWorkout(workoutToDelete.value.id)
    showSnackbar('Allenamento eliminato con successo', 'success')
    deleteDialogOpen.value = false
    workoutToDelete.value = null
  } catch (error) {
    showSnackbar('Errore nell\'eliminazione dell\'allenamento', 'error')
  }
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

function handleDateSelect(start: Date, end: Date) {
  // Quando l'utente seleziona un range di date nel calendario, apre il dialog di creazione
  // con le date precompilate
  if (authStore.isAdmin || authStore.isAllenatore) {
    isEditMode.value = false

    // Preimposta la data del giorno selezionato con ora 8:00-20:00
    const startDate = new Date(start)
    startDate.setHours(8, 0, 0, 0)

    const endDate = new Date(start)
    endDate.setHours(20, 0, 0, 0)

    currentWorkout.value = {
      id: '',
      groupId: '',
      notes: '',
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      type: '' as any,
      createdById: authStore.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      group: { id: '', name: '' },
      createdBy: {
        id: authStore.user!.id,
        username: authStore.user!.username,
      },
    }

    dialogOpen.value = true
  }
}

function showSnackbar(message: string, color: string) {
  snackbar.value = {
    show: true,
    message,
    color,
  }
}

function openPublicPage() {
  window.open('/public/workouts', '_blank')
}
</script>
