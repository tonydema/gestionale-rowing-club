<template>
  <div class="full-calendar-wrapper">
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import type { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import type { CalendarEvent } from '@/types/calendar.types'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS } from '@/types/calendar.types'

const props = defineProps<{
  events: CalendarEvent[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'event-click', event: CalendarEvent): void
  (e: 'date-select', start: Date, end: Date): void
}>()

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
  },
  locale: 'it',
  buttonText: {
    today: 'Oggi',
    month: 'Mese',
    week: 'Settimana',
    day: 'Giorno',
    list: 'Lista',
  },
  weekends: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  editable: false,
  droppable: false,
  events: props.events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDateTime,
    end: event.endDateTime,
    backgroundColor: EVENT_TYPE_COLORS[event.type],
    borderColor: EVENT_TYPE_COLORS[event.type],
    extendedProps: {
      type: event.type,
      description: event.description,
      notes: event.notes,
      participants: event.participants,
      coaches: event.coaches,
      fullEvent: event,
    },
  })),
  eventClick: handleEventClick,
  select: handleDateSelect,
  eventDisplay: 'block',
  displayEventTime: true,
  displayEventEnd: true,
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  },
  height: 'auto',
  contentHeight: 650,
  firstDay: 1, // Lunedì
}))

function handleEventClick(clickInfo: EventClickArg) {
  const fullEvent = clickInfo.event.extendedProps.fullEvent as CalendarEvent
  emit('event-click', fullEvent)
}

function handleDateSelect(selectInfo: DateSelectArg) {
  emit('date-select', selectInfo.start, selectInfo.end)
}
</script>

<style scoped>
.full-calendar-wrapper {
  background: white;
  padding: 16px;
  border-radius: 4px;
}

:deep(.fc) {
  font-family: 'Roboto', sans-serif;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem !important;
  font-weight: 500;
}

:deep(.fc-button) {
  background-color: rgb(var(--v-theme-primary)) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
  text-transform: capitalize;
  font-weight: 500;
}

:deep(.fc-button:hover) {
  background-color: rgba(var(--v-theme-primary), 0.8) !important;
}

:deep(.fc-button-active) {
  background-color: rgba(var(--v-theme-primary), 0.9) !important;
}

:deep(.fc-daygrid-event) {
  cursor: pointer;
  padding: 2px 4px;
  margin-bottom: 2px;
}

:deep(.fc-timegrid-event) {
  cursor: pointer;
}

:deep(.fc-list-event) {
  cursor: pointer;
}

:deep(.fc-event-title) {
  font-weight: 500;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.9rem;
  padding: 8px;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 8px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

:deep(.fc-day-today) {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

:deep(.fc-h-event) {
  border: none !important;
}
</style>
