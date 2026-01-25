import type { User } from './auth.types'

export enum CalendarEventType {
  DISPONIBILITA_ALLENATORE = 'DISPONIBILITA_ALLENATORE',
  LEZIONE_SINGOLA = 'LEZIONE_SINGOLA',
  LEZIONE_GRUPPO = 'LEZIONE_GRUPPO',
  GARA = 'GARA',
  EVENTO_GENERICO = 'EVENTO_GENERICO',
}

export interface EventParticipant {
  id: string
  eventId: string
  userId: string
  createdAt: string
  user: {
    id: string
    username: string
    email?: string | null
    roles: string[]
    member?: {
      id: string
      firstName: string
      lastName: string
    } | null
  }
}

export interface EventCoach {
  id: string
  eventId: string
  userId: string
  createdAt: string
  user: {
    id: string
    username: string
    email?: string | null
    roles: string[]
    member?: {
      id: string
      firstName: string
      lastName: string
    } | null
  }
}

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  description?: string | null
  notes?: string | null
  startDateTime: string
  endDateTime: string
  createdById: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    username: string
    email?: string | null
    roles: string[]
  }
  participants: EventParticipant[]
  coaches: EventCoach[]
}

export interface CreateEventDto {
  type: CalendarEventType
  title: string
  description?: string
  notes?: string
  startDateTime: string
  endDateTime: string
  participantIds?: string[]
  coachIds?: string[]
}

export interface UpdateEventDto {
  type?: CalendarEventType
  title?: string
  description?: string
  notes?: string
  startDateTime?: string
  endDateTime?: string
  participantIds?: string[]
  coachIds?: string[]
}

export interface QueryEventsDto {
  types?: CalendarEventType[]
  startDate?: string
  endDate?: string
}

// Utilità per i colori degli eventi
export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  [CalendarEventType.DISPONIBILITA_ALLENATORE]: '#4CAF50', // Verde
  [CalendarEventType.LEZIONE_SINGOLA]: '#2196F3', // Blu
  [CalendarEventType.LEZIONE_GRUPPO]: '#9C27B0', // Viola
  [CalendarEventType.GARA]: '#F44336', // Rosso
  [CalendarEventType.EVENTO_GENERICO]: '#FF9800', // Arancione
}

// Label per i tipi di evento
export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  [CalendarEventType.DISPONIBILITA_ALLENATORE]: 'Disponibilità Allenatore',
  [CalendarEventType.LEZIONE_SINGOLA]: 'Lezione Singola',
  [CalendarEventType.LEZIONE_GRUPPO]: 'Lezione di Gruppo',
  [CalendarEventType.GARA]: 'Gara',
  [CalendarEventType.EVENTO_GENERICO]: 'Evento Generico',
}

// Icone Material Design per i tipi di evento
export const EVENT_TYPE_ICONS: Record<CalendarEventType, string> = {
  [CalendarEventType.DISPONIBILITA_ALLENATORE]: 'mdi-calendar-check',
  [CalendarEventType.LEZIONE_SINGOLA]: 'mdi-account',
  [CalendarEventType.LEZIONE_GRUPPO]: 'mdi-account-group',
  [CalendarEventType.GARA]: 'mdi-trophy',
  [CalendarEventType.EVENTO_GENERICO]: 'mdi-calendar-star',
}
