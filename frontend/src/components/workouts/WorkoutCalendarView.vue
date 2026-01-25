<template>
  <div class="workout-calendar-wrapper">
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
import type { Workout, WorkoutType } from '@/types/workout.types'
import { WORKOUT_TYPE_LABELS } from '@/types/workout.types'

const props = defineProps<{
  workouts: Workout[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'workout-click', workout: Workout): void
  (e: 'date-select', start: Date, end: Date): void
}>()

const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  PESI: '#FF9800',
  CORSA: '#4CAF50',
  REMERGOMETRO: '#2196F3',
  BARCA: '#00BCD4',
  BIKE: '#9C27B0',
}

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
  events: props.workouts.map((workout) => ({
    id: workout.id,
    title: `${WORKOUT_TYPE_LABELS[workout.type]} - ${workout.group.name}`,
    start: workout.startDateTime,
    end: workout.endDateTime,
    backgroundColor: WORKOUT_TYPE_COLORS[workout.type],
    borderColor: WORKOUT_TYPE_COLORS[workout.type],
    extendedProps: {
      type: workout.type,
      groupName: workout.group.name,
      notes: workout.notes,
      distance: workout.distance,
      repetitions: workout.repetitions,
      weightDescription: workout.weightDescription,
      fullWorkout: workout,
    },
  })),
  eventContent: (arg) => {
    const title = arg.event.title
    const notes = arg.event.extendedProps.notes
    const timeText = arg.timeText

    let html = `<div class="fc-event-main-content">`
    if (timeText) {
      html += `<div class="fc-event-time">${timeText}</div>`
    }
    html += `<div class="fc-event-title">${title}</div>`
    if (notes) {
      html += `<div class="fc-event-notes">${notes}</div>`
    }
    html += `</div>`

    return { html }
  },
  eventClick: handleWorkoutClick,
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

function handleWorkoutClick(clickInfo: EventClickArg) {
  const fullWorkout = clickInfo.event.extendedProps.fullWorkout as Workout
  emit('workout-click', fullWorkout)
}

function handleDateSelect(selectInfo: DateSelectArg) {
  emit('date-select', selectInfo.start, selectInfo.end)
}
</script>

<style scoped>
.workout-calendar-wrapper {
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

:deep(.fc-event-main-content) {
  padding: 2px 4px;
  overflow: hidden;
}

:deep(.fc-event-notes) {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
