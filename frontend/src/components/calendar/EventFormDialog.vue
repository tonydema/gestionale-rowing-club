<template>
  <v-dialog :model-value="modelValue" max-width="900px" persistent scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ isEditMode ? 'mdi-calendar-edit' : 'mdi-calendar-plus' }}</v-icon>
        <span class="text-h5">{{ isEditMode ? 'Modifica Evento' : 'Nuovo Evento' }}</span>
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="save">
          <v-row>
            <!-- Tipologia -->
            <v-col cols="12">
              <v-select
                v-model="formData.type"
                :items="eventTypeOptions"
                label="Tipologia Evento *"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              >
                <template #item="{ item, props }">
                  <v-list-item
                    v-bind="props"
                    :prepend-icon="EVENT_TYPE_ICONS[item.value]"
                  />
                </template>
                <template #selection="{ item }">
                  <v-chip :color="EVENT_TYPE_COLORS[item.value]" :prepend-icon="EVENT_TYPE_ICONS[item.value]">
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>
            </v-col>

            <!-- Titolo -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.title"
                label="Titolo *"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Descrizione -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Descrizione"
                variant="outlined"
                rows="3"
              />
            </v-col>

            <!-- Data e ora inizio -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.startDate"
                label="Data Inizio *"
                type="date"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.startTime"
                label="Ora Inizio *"
                type="time"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Data e ora fine -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.endDate"
                label="Data Fine *"
                type="date"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.endTime"
                label="Ora Fine *"
                type="time"
                :rules="[(v) => !!v || 'Campo obbligatorio']"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Allenatori (per DISPONIBILITA_ALLENATORE, LEZIONE_SINGOLA, LEZIONE_GRUPPO) -->
            <v-col
              v-if="
                formData.type === 'DISPONIBILITA_ALLENATORE' ||
                formData.type === 'LEZIONE_SINGOLA' ||
                formData.type === 'LEZIONE_GRUPPO'
              "
              cols="12"
            >
              <v-select
                v-model="formData.coachIds"
                :items="coachOptions"
                :label="
                  formData.type === 'LEZIONE_SINGOLA' || formData.type === 'LEZIONE_GRUPPO'
                    ? 'Istruttore/i *'
                    : 'Allenatore *'
                "
                :rules="[(v) => !!v && v.length > 0 || 'Campo obbligatorio']"
                :multiple="formData.type !== 'LEZIONE_SINGOLA'"
                variant="outlined"
                chips
                closable-chips
                required
                @update:model-value="updateTitleForCoaches"
              />
            </v-col>

            <!-- Partecipanti (per LEZIONE_SINGOLA) -->
            <v-col v-if="formData.type === 'LEZIONE_SINGOLA'" cols="12">
              <v-select
                v-model="formData.participantIds"
                :items="athleteOptions"
                label="Partecipante *"
                :rules="[
                  (v) => !!v && v.length === 1 || 'Seleziona esattamente un partecipante',
                ]"
                variant="outlined"
                chips
                closable-chips
                required
              />
            </v-col>

            <!-- Partecipanti (per LEZIONE_GRUPPO, GARA, EVENTO_GENERICO) -->
            <v-col
              v-if="
                formData.type === 'LEZIONE_GRUPPO' ||
                formData.type === 'GARA' ||
                formData.type === 'EVENTO_GENERICO'
              "
              cols="12"
            >
              <v-select
                v-model="formData.participantIds"
                :items="athleteOptions"
                :label="
                  formData.type === 'GARA' || formData.type === 'LEZIONE_GRUPPO'
                    ? 'Partecipanti *'
                    : 'Partecipanti'
                "
                :rules="[
                  (v) =>
                    formData.type === 'EVENTO_GENERICO' ||
                    (!!v && v.length > 0) ||
                    'Campo obbligatorio',
                ]"
                multiple
                variant="outlined"
                chips
                closable-chips
              />
            </v-col>

            <!-- Note -->
            <v-col cols="12">
              <v-textarea v-model="formData.notes" label="Note" variant="outlined" rows="2" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Annulla</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="save">Salva</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useMembersStore } from '@/stores/members'
import type { CalendarEvent, CalendarEventType } from '@/types/calendar.types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS } from '@/types/calendar.types'

const props = defineProps<{
  modelValue: boolean
  event: CalendarEvent | null
  isEditMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const calendarStore = useCalendarStore()
const membersStore = useMembersStore()

const formRef = ref<any>(null)
const loading = ref(false)

const formData = ref({
  type: '' as CalendarEventType | '',
  title: '',
  description: '',
  notes: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  participantIds: [] as string[],
  coachIds: [] as string[],
})

const eventTypeOptions = computed(() => {
  return Object.entries(EVENT_TYPE_LABELS).map(([value, title]) => ({
    value,
    title,
  }))
})

const athleteOptions = computed(() => {
  return membersStore.members
    .filter((m) => m.isActive && m.user?.roles.includes('ATLETA'))
    .map((m) => ({
      value: m.userId,
      title: `${m.firstName} ${m.lastName}`,
    }))
})

const coachOptions = computed(() => {
  return membersStore.members
    .filter((m) => m.user?.roles.includes('ALLENATORE'))
    .map((m) => ({
      value: m.userId,
      title: `${m.firstName} ${m.lastName}`,
    }))
})

onMounted(async () => {
  // Carica atleti se non già caricati
  if (membersStore.members.length === 0) {
    await membersStore.fetchMembers({ page: 1, limit: 1000, isActive: true })
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (props.isEditMode && props.event) {
        loadEventData(props.event)
      } else if (props.event && props.event.startDateTime) {
        // Modalità creazione con date preimpostate
        loadEventData(props.event)
      } else {
        resetForm()
      }
    }
  }
)

function loadEventData(event: CalendarEvent) {
  const startDateTime = new Date(event.startDateTime)
  const endDateTime = new Date(event.endDateTime)

  formData.value = {
    type: event.type,
    title: event.title,
    description: event.description || '',
    notes: event.notes || '',
    startDate: startDateTime.toISOString().split('T')[0],
    startTime: startDateTime.toTimeString().slice(0, 5),
    endDate: endDateTime.toISOString().split('T')[0],
    endTime: endDateTime.toTimeString().slice(0, 5),
    participantIds: event.participants.map((p) => p.userId),
    coachIds: event.coaches.map((c) => c.userId),
  }
}

function resetForm() {
  formData.value = {
    type: '',
    title: '',
    description: '',
    notes: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    participantIds: [],
    coachIds: [],
  }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const eventData = {
      type: formData.value.type as CalendarEventType,
      title: formData.value.title,
      description: formData.value.description || undefined,
      notes: formData.value.notes || undefined,
      startDateTime: `${formData.value.startDate}T${formData.value.startTime}:00`,
      endDateTime: `${formData.value.endDate}T${formData.value.endTime}:00`,
      participantIds:
        formData.value.participantIds.length > 0 ? formData.value.participantIds : undefined,
      coachIds: formData.value.coachIds.length > 0 ? formData.value.coachIds : undefined,
    }

    if (props.isEditMode && props.event) {
      await calendarStore.updateEvent(props.event.id, eventData)
    } else {
      await calendarStore.createEvent(eventData)
    }

    emit('save')
    emit('update:modelValue', false)
  } catch (error: any) {
    console.error('Error saving event:', error)
    alert(error.response?.data?.message || 'Errore nel salvataggio dell\'evento')
  } finally {
    loading.value = false
  }
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function updateTitleForCoaches() {
  // Auto-compila il titolo quando è una disponibilità allenatore
  if (formData.value.type === 'DISPONIBILITA_ALLENATORE' && formData.value.coachIds.length > 0) {
    const selectedCoaches = formData.value.coachIds
      .map((id) => {
        const coach = coachOptions.value.find((c) => c.value === id)
        return coach?.title || ''
      })
      .filter(Boolean)

    if (selectedCoaches.length > 0) {
      formData.value.title = `Disponibilità ${selectedCoaches.join(', ')}`
    }
  }
}
</script>
