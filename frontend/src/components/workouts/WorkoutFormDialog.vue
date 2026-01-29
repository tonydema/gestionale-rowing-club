<template>
  <v-dialog :model-value="modelValue" max-width="800px" persistent @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="bg-primary">
        <span class="text-white">{{ isEditMode ? 'Modifica Allenamento' : 'Nuovo Allenamento' }}</span>
      </v-card-title>

      <v-card-text class="pt-6">
        <v-form ref="formRef" v-model="valid">
          <v-row>
            <!-- Gruppo -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.groupId"
                :items="groupOptions"
                label="Gruppo *"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-account-multiple"
              />
            </v-col>

            <!-- Tipologia -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.type"
                :items="workoutTypeOptions"
                label="Tipologia allenamento *"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-format-list-bulleted-type"
              />
            </v-col>

            <!-- Data -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.date"
                label="Data *"
                type="date"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>

            <!-- Orario con range slider -->
            <v-col cols="12" md="6">
              <div class="d-flex align-center justify-center" style="height: 40px;">
                <v-chip color="primary" variant="tonal" size="large">
                  <v-icon start>mdi-clock-outline</v-icon>
                  {{ formatTime(form.timeRange[0]) }} - {{ formatTime(form.timeRange[1]) }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12">
              <v-range-slider
                v-model="form.timeRange"
                :min="0"
                :max="96"
                :step="1"
                color="primary"
                track-color="grey-lighten-2"
                thumb-label="always"
                :thumb-size="20"
              >
                <template #thumb-label="{ modelValue }">
                  {{ formatTime(modelValue) }}
                </template>
              </v-range-slider>
              <div class="d-flex justify-space-between text-caption text-grey mt-n2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </v-col>

            <!-- Campi condizionali per CORSA, REMERGOMETRO, BARCA, BIKE -->
            <template v-if="form.type && form.type !== 'PESI'">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.distance"
                  label="Distanza (metri)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.positiveNumber]"
                  prepend-inner-icon="mdi-map-marker-distance"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.repetitions"
                  label="Ripetizioni"
                  type="number"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.positiveInteger]"
                  prepend-inner-icon="mdi-repeat"
                />
              </v-col>
            </template>

            <!-- Campo descrittivo per PESI -->
            <template v-if="form.type === 'PESI'">
              <v-col cols="12">
                <v-textarea
                  v-model="form.weightDescription"
                  label="Descrizione esercizi"
                  variant="outlined"
                  density="compact"
                  rows="4"
                  placeholder="Es: 3x10 panca piana, 3x12 squat, 4x8 stacchi..."
                  prepend-inner-icon="mdi-text"
                />
              </v-col>
            </template>

            <!-- Note -->
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Note (opzionale)"
                variant="outlined"
                density="compact"
                rows="3"
                prepend-inner-icon="mdi-note-text"
              />
            </v-col>

            <!-- Duplicazione (solo in creazione) -->
            <v-col v-if="!isEditMode" cols="12" md="6">
              <v-text-field
                v-model.number="form.duplicateWeeks"
                label="Duplica per le prossime settimane (opzionale)"
                type="number"
                variant="outlined"
                density="compact"
                hint="Inserisci un numero per replicare l'allenamento nelle settimane successive"
                persistent-hint
                :rules="[rules.positiveInteger]"
                prepend-inner-icon="mdi-calendar-multiple"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleCancel">Annulla</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          :disabled="!valid"
          @click="handleSave"
        >
          {{ isEditMode ? 'Salva modifiche' : 'Crea allenamento' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useWorkoutStore } from '@/stores/workout'
import { useGroupsStore } from '@/stores/groups'
import type { Workout, WorkoutType, CreateWorkoutDto, UpdateWorkoutDto } from '@/types/workout.types'
import { WORKOUT_TYPE_LABELS } from '@/types/workout.types'

const props = defineProps<{
  modelValue: boolean
  workout: Workout | null
  isEditMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const workoutStore = useWorkoutStore()
const groupStore = useGroupsStore()

const formRef = ref()
const valid = ref(false)
const loading = ref(false)

const form = ref({
  groupId: '',
  type: '' as WorkoutType | '',
  date: '',
  timeRange: [24, 32] as [number, number], // Default: 06:00 - 08:00 (ogni step = 15 min)
  distance: null as number | null,
  repetitions: null as number | null,
  weightDescription: '',
  notes: '',
  duplicateWeeks: null as number | null,
})

// Converte il valore dello slider (0-96) in orario HH:MM
function formatTime(sliderValue: number): string {
  const totalMinutes = sliderValue * 15
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Converte orario HH:MM in valore slider (0-96)
function timeToSliderValue(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return Math.round((hours * 60 + minutes) / 15)
}

const rules = {
  required: (v: any) => !!v || 'Campo obbligatorio',
  positiveNumber: (v: any) => v === null || v === '' || v >= 0 || 'Deve essere un numero positivo',
  positiveInteger: (v: any) => v === null || v === '' || (Number.isInteger(Number(v)) && v >= 1) || 'Deve essere un numero intero positivo',
}

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

onMounted(async () => {
  await groupStore.fetchGroups()
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetForm()
      if (props.workout) {
        if (props.isEditMode) {
          // Modifica: carica tutti i dati
          populateForm(props.workout)
        } else if (props.workout.startDateTime) {
          // Creazione con data precompilata dal calendario
          const startDate = new Date(props.workout.startDateTime)
          const endDate = new Date(props.workout.endDateTime)
          const startTime = startDate.toTimeString().slice(0, 5)
          const endTime = endDate.toTimeString().slice(0, 5)
          form.value.date = startDate.toISOString().split('T')[0]
          form.value.timeRange = [timeToSliderValue(startTime), timeToSliderValue(endTime)]
        }
      }
    }
  }
)

// Reset condizionali quando cambia il tipo
watch(
  () => form.value.type,
  (newType, oldType) => {
    if (newType !== oldType) {
      if (newType === 'PESI') {
        form.value.distance = null
        form.value.repetitions = null
      } else {
        form.value.weightDescription = ''
      }
    }
  }
)

function resetForm() {
  form.value = {
    groupId: '',
    type: '' as WorkoutType | '',
    date: '',
    timeRange: [24, 32], // Default: 06:00 - 08:00
    distance: null,
    repetitions: null,
    weightDescription: '',
    notes: '',
    duplicateWeeks: null,
  }
  formRef.value?.resetValidation()
}

function populateForm(workout: Workout) {
  const startDate = new Date(workout.startDateTime)
  const endDate = new Date(workout.endDateTime)

  const startTime = startDate.toTimeString().slice(0, 5)
  const endTime = endDate.toTimeString().slice(0, 5)

  form.value = {
    groupId: workout.groupId,
    type: workout.type,
    date: startDate.toISOString().split('T')[0],
    timeRange: [timeToSliderValue(startTime), timeToSliderValue(endTime)],
    distance: workout.distance || null,
    repetitions: workout.repetitions || null,
    weightDescription: workout.weightDescription || '',
    notes: workout.notes || '',
    duplicateWeeks: null,
  }
}

async function handleSave() {
  const isValid = await formRef.value?.validate()
  if (!isValid.valid) return

  loading.value = true
  try {
    const startTime = formatTime(form.value.timeRange[0])
    const endTime = formatTime(form.value.timeRange[1])
    const startDateTime = new Date(`${form.value.date}T${startTime}`)
    const endDateTime = new Date(`${form.value.date}T${endTime}`)

    if (props.isEditMode && props.workout) {
      // Update
      const updateDto: UpdateWorkoutDto = {
        groupId: form.value.groupId,
        type: form.value.type as WorkoutType,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        notes: form.value.notes || undefined,
        distance: form.value.type !== 'PESI' && form.value.distance ? form.value.distance : undefined,
        repetitions: form.value.type !== 'PESI' && form.value.repetitions ? form.value.repetitions : undefined,
        weightDescription: form.value.type === 'PESI' && form.value.weightDescription ? form.value.weightDescription : undefined,
      }

      await workoutStore.updateWorkout(props.workout.id, updateDto)
    } else {
      // Create
      const createDto: CreateWorkoutDto = {
        groupId: form.value.groupId,
        type: form.value.type as WorkoutType,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        notes: form.value.notes || undefined,
        distance: form.value.type !== 'PESI' && form.value.distance ? form.value.distance : undefined,
        repetitions: form.value.type !== 'PESI' && form.value.repetitions ? form.value.repetitions : undefined,
        weightDescription: form.value.type === 'PESI' && form.value.weightDescription ? form.value.weightDescription : undefined,
        duplicateWeeks: form.value.duplicateWeeks || undefined,
      }

      await workoutStore.createWorkout(createDto)
    }

    emit('save')
  } catch (error: any) {
    console.error('Error saving workout:', error)
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>
