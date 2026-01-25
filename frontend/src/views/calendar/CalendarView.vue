<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Calendario Eventi</h1>
        <p class="text-grey-darken-1">Gestisci lezioni, gare e disponibilità</p>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Eventi</span>
        <v-btn
          v-if="authStore.isAdmin || authStore.isSegreteria || authStore.isAllenatore"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nuovo Evento
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Filtri -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedTypes"
              :items="eventTypeOptions"
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
                  :color="getEventTypeColor(item.value)"
                  :prepend-icon="getEventTypeIcon(item.value)"
                >
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="startDate"
              label="Data inizio"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
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

        <!-- Vista Calendario FullCalendar -->
        <FullCalendarView
          :events="filteredEvents"
          :loading="calendarStore.loading"
          @event-click="viewEvent"
          @date-select="handleDateSelect"
        />
      </v-card-text>
    </v-card>

    <!-- Dialog Crea/Modifica Evento -->
    <EventFormDialog
      v-model="dialogOpen"
      :event="currentEvent"
      :is-edit-mode="isEditMode"
      @save="handleSaveEvent"
      @cancel="dialogOpen = false"
    />

    <!-- Dialog Visualizza Evento -->
    <EventDetailDialog
      v-model="viewDialogOpen"
      :event="calendarStore.currentEvent"
      @edit="editFromView"
      @delete="deleteFromView"
      @close="viewDialogOpen = false"
    />

    <!-- Dialog Conferma Eliminazione -->
    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>Conferma Eliminazione</v-card-title>
        <v-card-text>
          Sei sicuro di voler eliminare l'evento "{{ eventToDelete?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Annulla</v-btn>
          <v-btn color="error" variant="flat" @click="deleteEvent">Elimina</v-btn>
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
import { useCalendarStore } from '@/stores/calendar'
import { useAuthStore } from '@/stores/auth'
import type { CalendarEvent, CalendarEventType } from '@/types/calendar.types'
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
} from '@/types/calendar.types'
import EventFormDialog from '@/components/calendar/EventFormDialog.vue'
import EventDetailDialog from '@/components/calendar/EventDetailDialog.vue'
import FullCalendarView from '@/components/calendar/FullCalendarView.vue'

const calendarStore = useCalendarStore()
const authStore = useAuthStore()

const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditMode = ref(false)
const currentEvent = ref<CalendarEvent | null>(null)
const eventToDelete = ref<CalendarEvent | null>(null)

const selectedTypes = ref<CalendarEventType[]>([])
const startDate = ref('')
const endDate = ref('')

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const eventTypeOptions = computed(() => {
  return Object.entries(EVENT_TYPE_LABELS).map(([value, title]) => ({
    value,
    title,
  }))
})

const filteredEvents = computed(() => {
  let filtered = calendarStore.events

  if (selectedTypes.value.length > 0) {
    filtered = filtered.filter((event) => selectedTypes.value.includes(event.type))
  }

  if (startDate.value) {
    filtered = filtered.filter((event) => event.startDateTime >= startDate.value)
  }

  if (endDate.value) {
    filtered = filtered.filter((event) => event.startDateTime <= endDate.value)
  }

  return filtered.sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  )
})

onMounted(async () => {
  await loadEvents()
})

watch([selectedTypes, startDate, endDate], () => {
  loadEvents()
})

async function loadEvents() {
  try {
    await calendarStore.fetchEvents({
      types: selectedTypes.value.length > 0 ? selectedTypes.value : undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    })
  } catch (error) {
    showSnackbar('Errore nel caricamento degli eventi', 'error')
  }
}

function openCreateDialog() {
  isEditMode.value = false
  currentEvent.value = null
  dialogOpen.value = true
}

function editEvent(event: CalendarEvent) {
  isEditMode.value = true
  currentEvent.value = event
  dialogOpen.value = true
}

async function viewEvent(event: CalendarEvent) {
  try {
    await calendarStore.fetchEventById(event.id)
    viewDialogOpen.value = true
  } catch (error) {
    showSnackbar("Errore nel caricamento dei dettagli dell'evento", 'error')
  }
}

function editFromView() {
  viewDialogOpen.value = false
  if (calendarStore.currentEvent) {
    isEditMode.value = true
    currentEvent.value = calendarStore.currentEvent
    dialogOpen.value = true
  }
}

function deleteFromView() {
  viewDialogOpen.value = false
  if (calendarStore.currentEvent) {
    confirmDelete(calendarStore.currentEvent)
  }
}

async function handleSaveEvent() {
  dialogOpen.value = false
  await loadEvents()
  showSnackbar(
    isEditMode.value ? 'Evento aggiornato con successo' : 'Evento creato con successo',
    'success'
  )
}

function confirmDelete(event: CalendarEvent) {
  eventToDelete.value = event
  deleteDialogOpen.value = true
}

async function deleteEvent() {
  if (!eventToDelete.value) return

  try {
    await calendarStore.deleteEvent(eventToDelete.value.id)
    showSnackbar('Evento eliminato con successo', 'success')
    deleteDialogOpen.value = false
    eventToDelete.value = null
  } catch (error) {
    showSnackbar("Errore nell'eliminazione dell'evento", 'error')
  }
}

function getEventTypeColor(type: CalendarEventType): string {
  return EVENT_TYPE_COLORS[type] || 'grey'
}

function getEventTypeLabel(type: CalendarEventType): string {
  return EVENT_TYPE_LABELS[type] || type
}

function getEventTypeIcon(type: CalendarEventType): string {
  return EVENT_TYPE_ICONS[type] || 'mdi-calendar'
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleDateSelect(start: Date, end: Date) {
  // Quando l'utente seleziona un range di date nel calendario, apre il dialog di creazione
  // con le date precompilate
  if (authStore.isAdmin || authStore.isSegreteria || authStore.isAllenatore) {
    isEditMode.value = false

    // Preimposta la data del giorno selezionato con ora 8:00-20:00
    const startDate = new Date(start)
    startDate.setHours(8, 0, 0, 0)

    const endDate = new Date(start)
    endDate.setHours(20, 0, 0, 0)

    currentEvent.value = {
      id: '',
      type: '' as any,
      title: '',
      description: '',
      notes: '',
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      participants: [],
      coaches: [],
      createdBy: authStore.user!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
</script>
