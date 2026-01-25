import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  CalendarEvent,
  CreateEventDto,
  UpdateEventDto,
  QueryEventsDto,
  CalendarEventType,
} from '@/types/calendar.types'
import { calendarService } from '@/services/calendar.service'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const currentEvent = ref<CalendarEvent | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeFilters = ref<CalendarEventType[]>([])

  async function fetchEvents(query?: QueryEventsDto) {
    loading.value = true
    error.value = null
    try {
      events.value = await calendarService.getAll(query)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Errore nel caricamento degli eventi'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventById(id: string) {
    loading.value = true
    error.value = null
    try {
      currentEvent.value = await calendarService.getById(id)
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nel caricamento dell'evento"
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEvent(data: CreateEventDto) {
    loading.value = true
    error.value = null
    try {
      const newEvent = await calendarService.create(data)
      events.value.push(newEvent)
      return newEvent
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nella creazione dell'evento"
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id: string, data: UpdateEventDto) {
    loading.value = true
    error.value = null
    try {
      const updatedEvent = await calendarService.update(id, data)
      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }
      return updatedEvent
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nell'aggiornamento dell'evento"
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(id: string) {
    loading.value = true
    error.value = null
    try {
      await calendarService.delete(id)
      events.value = events.value.filter((e) => e.id !== id)
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || "Errore nell'eliminazione dell'evento"
      throw err
    } finally {
      loading.value = false
    }
  }

  function setActiveFilters(filters: CalendarEventType[]) {
    activeFilters.value = filters
  }

  function clearFilters() {
    activeFilters.value = []
  }

  return {
    events,
    currentEvent,
    loading,
    error,
    activeFilters,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    setActiveFilters,
    clearFilters,
  }
})
